import express from 'express';
import { db } from '../db/index.js';
import { analyzeClinicalIntake } from '../services/llmTriage.js';
import { verifyAuth, requireRole } from '../middleware/auth.js';

export const triageRouter = express.Router();

// Submit Student Clinical Intake (Allowed: STUDENT, CLINICIAN, ADMIN)
triageRouter.post('/submit', verifyAuth, requireRole(['STUDENT', 'CLINICIAN', 'ADMIN']), async (req, res) => {
  try {
    const {
      studentName,
      matricNo,
      jajaNo,
      faculty,
      department,
      visitCategory,
      preferredDate,
      complaint,
      painScale,
      duration,
      answers
    } = req.body;

    if (!complaint || !complaint.trim()) {
      return res.status(400).json({ error: 'Chief complaint is required for clinical triage.' });
    }

    // 1. Run LLM Clinical Analysis (Google Gemini or Clinical Heuristic Fallback)
    const triageEvaluation = await analyzeClinicalIntake({
      complaint,
      painScale: Number(painScale) || 3,
      duration,
      answers: answers || []
    });

    const store = db.getStore();
    let nextSeq = 1;
    if (store?.triageCases?.length > 0) {
      const existingNums = store.triageCases
        .map(c => parseInt(c.queueNo, 10))
        .filter(n => !isNaN(n));
      if (existingNums.length > 0) {
        nextSeq = Math.max(...existingNums) + 1;
      } else {
        nextSeq = store.triageCases.length + 1;
      }
    }
    const systemQueueNo = String(nextSeq).padStart(3, '0');

    const ticketId = `TRG-${Date.now().toString().slice(-4)}`;

    const newCase = {
      id: ticketId,
      queueNo: systemQueueNo,
      patientName: req.body.patientName || studentName || 'Patient',
      hospitalCardNo: req.body.hospitalCardNo || matricNo || '',
      age: req.body.age || '',
      gender: req.body.gender || '',
      intakeMode: req.body.intakeMode || 'SELF_WALKIN',
      contactPhone: req.body.contactPhone || '',
      presentationType: req.body.presentationType || 'Walk-in alone',
      primaryLanguage: req.body.primaryLanguage || 'English',
      clerkSignature: req.body.clerkSignature || 'Triage Desk Nurse / OPD Clerk',
      studentName: req.body.patientName || studentName || 'Patient',
      matricNo: req.body.hospitalCardNo || matricNo || '',
      jajaNo: jajaNo || '',
      faculty: faculty || '',
      department: department || '',
      visitCategory: visitCategory || 'General Consultation',
      preferredDate: preferredDate || new Date().toISOString().split('T')[0],
      submittedAt: 'Just now',
      complaint,
      duration: duration || 'Not specified',
      painScale: Number(painScale) || 3,
      answers: answers || [],
      aiTriage: {
        suggestedPriority: triageEvaluation.priority,
        urgencyScore: triageEvaluation.urgencyScore,
        patientBrief: triageEvaluation.patientBrief,
        safetyWarnings: triageEvaluation.safetyWarnings || [],
        suggestedRoom: triageEvaluation.suggestedRoom,
        recommendedSession: triageEvaluation.recommendedSession,
        source: triageEvaluation.source
      },
      status: 'PENDING_APPROVAL',
      clinicianNotes: '',
      assignedRoom: triageEvaluation.suggestedRoom,
      assignedSession: triageEvaluation.recommendedSession
    };

    // 2. Persist in Postgres if connected, otherwise save in store
    if (db.isPostgres()) {
      try {
        await db.query(
          `INSERT INTO triage_cases 
          (id, student_name, matric_no, jaja_no, faculty, department, visit_category, preferred_date, complaint, pain_scale, duration, clinical_answers, llm_priority, llm_urgency_score, llm_patient_brief, llm_safety_warnings, suggested_room, recommended_session, status, assigned_room, assigned_session)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
          [
            newCase.id, newCase.studentName, newCase.matricNo, newCase.jajaNo,
            newCase.faculty, newCase.department, newCase.visitCategory, newCase.preferredDate,
            newCase.complaint, newCase.painScale, newCase.duration, JSON.stringify(newCase.answers),
            newCase.aiTriage.suggestedPriority, newCase.aiTriage.urgencyScore, newCase.aiTriage.patientBrief,
            newCase.aiTriage.safetyWarnings, newCase.aiTriage.suggestedRoom, newCase.aiTriage.recommendedSession,
            newCase.status, newCase.assignedRoom, newCase.assignedSession
          ]
        );
      } catch (dbErr) {
        console.warn('Postgres insert failed, keeping in-memory:', dbErr.message);
      }
    }

    store.triageCases.unshift(newCase);

    res.status(201).json({
      success: true,
      case: newCase,
      message: `Intake triaged by ${triageEvaluation.source} as ${triageEvaluation.priority} priority.`
    });
  } catch (err) {
    console.error('Triage submit error:', err);
    res.status(500).json({ error: 'Failed to process clinical triage intake' });
  }
});

// Get Active Triage Queue (Strictly CLINICIAN & ADMIN Only)
triageRouter.get('/queue', verifyAuth, requireRole(['CLINICIAN', 'ADMIN']), async (req, res) => {
  try {
    if (db.isPostgres()) {
      try {
        const result = await db.query('SELECT * FROM triage_cases ORDER BY created_at DESC');
        return res.json({ success: true, queue: result.rows });
      } catch (dbErr) {
        console.warn('Postgres query failed, falling back to memory queue');
      }
    }

    const store = db.getStore();
    res.json({ success: true, queue: store.triageCases });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch triage queue' });
  }
});

// Get Student's Own Active Triage Status
triageRouter.get('/my-case', verifyAuth, (req, res) => {
  const store = db.getStore();
  const matric = req.user?.matricNo;
  const userCase = store.triageCases.find(c => c.matricNo === matric || c.studentName === req.user?.name);
  res.json({ success: true, case: userCase || null });
});

// Clinician 1-Click Approval (Strictly CLINICIAN & ADMIN Only)
triageRouter.post('/:id/approve', verifyAuth, requireRole(['CLINICIAN', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { room, session, notes } = req.body;

    const store = db.getStore();
    const triageItem = store.triageCases.find(c => c.id === id);

    if (!triageItem) {
      return res.status(404).json({ error: 'Triage ticket not found' });
    }

    triageItem.status = 'APPROVED';
    if (room) triageItem.assignedRoom = room;
    if (session) triageItem.assignedSession = session;
    triageItem.clinicianNotes = notes || 'AI Triage reviewed and verified by attending consultant.';

    if (db.isPostgres()) {
      try {
        await db.query(
          `UPDATE triage_cases SET status = 'APPROVED', assigned_room = $1, assigned_session = $2, clinician_notes = $3 WHERE id = $4`,
          [triageItem.assignedRoom, triageItem.assignedSession, triageItem.clinicianNotes, id]
        );
      } catch (e) {}
    }

    res.json({ success: true, case: triageItem });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve triage case' });
  }
});

// Clinician Override (Strictly CLINICIAN & ADMIN Only)
triageRouter.post('/:id/override', verifyAuth, requireRole(['CLINICIAN', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { newPriority, room, session, notes } = req.body;

    const store = db.getStore();
    const triageItem = store.triageCases.find(c => c.id === id);

    if (!triageItem) {
      return res.status(404).json({ error: 'Triage ticket not found' });
    }

    triageItem.status = 'OVERRIDDEN';
    if (newPriority) triageItem.aiTriage.suggestedPriority = newPriority;
    if (room) triageItem.assignedRoom = room;
    if (session) triageItem.assignedSession = session;
    triageItem.clinicianNotes = notes || 'Clinician adjusted priority after secondary evaluation.';

    if (db.isPostgres()) {
      try {
        await db.query(
          `UPDATE triage_cases SET status = 'OVERRIDDEN', llm_priority = $1, assigned_room = $2, assigned_session = $3, clinician_notes = $4 WHERE id = $5`,
          [newPriority, triageItem.assignedRoom, triageItem.assignedSession, triageItem.clinicianNotes, id]
        );
      } catch (e) {}
    }

    res.json({ success: true, case: triageItem });
  } catch (err) {
    res.status(500).json({ error: 'Failed to override triage case' });
  }
});
