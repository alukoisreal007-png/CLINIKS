import express from 'express';
import { db } from '../db/index.js';
import { generateToken, verifyAuth } from '../middleware/auth.js';

export const authRouter = express.Router();

// Student Login / Verification
authRouter.post('/login-student', async (req, res) => {
  try {
    const { matricNo, jajaNo, name, email } = req.body;

    if (db.isPostgres()) {
      const result = await db.query(
        'SELECT * FROM student_profiles WHERE matric_no = $1 OR jaja_no = $2',
        [matricNo, jajaNo]
      );
      if (result.rows.length > 0) {
        const student = result.rows[0];
        const token = generateToken({ id: student.id, role: 'STUDENT', matricNo: student.matric_no, name: student.name });
        return res.json({ success: true, token, profile: student, role: 'STUDENT' });
      }
    }

    // In-memory or new student profile creation
    const store = db.getStore();
    let profile = store.studentProfiles.find(s => s.matricNo === matricNo || s.jajaNo === jajaNo);
    
    if (!profile) {
      profile = {
        id: `STU-${Date.now().toString().slice(-4)}`,
        name: name || 'Student',
        email: email || '',
        matricNo: matricNo || '',
        jajaNo: jajaNo || '',
        faculty: req.body.faculty || '',
        department: req.body.department || '',
        level: req.body.level || '',
        bloodGroup: req.body.bloodGroup || '',
        genotype: req.body.genotype || '',
        allergies: req.body.allergies || [],
        emergencyContact: req.body.emergencyContact || '',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
      };
      store.studentProfiles.push(profile);
    }

    const token = generateToken({ id: profile.id, role: 'STUDENT', matricNo: profile.matricNo, name: profile.name });
    res.json({ success: true, token, profile, role: 'STUDENT' });
  } catch (err) {
    console.error('Login student error:', err);
    res.status(500).json({ error: 'Failed to authenticate student profile' });
  }
});

// Clinician Staff Authentication
authRouter.post('/login-clinician', async (req, res) => {
  try {
    const { staffId, email, name, office, title } = req.body;

    const clinicianProfile = {
      name: name || 'Attending Physician',
      title: title || 'Attending Clinical Consultant',
      staffId: staffId || 'MED-STAFF',
      jajaOffice: office || 'Clinic Wing A',
      email: email || '',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'
    };

    const token = generateToken({ id: clinicianProfile.staffId, role: 'CLINICIAN', staffId: clinicianProfile.staffId, name: clinicianProfile.name });
    res.json({ success: true, token, profile: clinicianProfile, role: 'CLINICIAN' });
  } catch (err) {
    console.error('Login clinician error:', err);
    res.status(500).json({ error: 'Failed to authenticate clinician staff' });
  }
});

// Verify Current Token Session
authRouter.get('/me', verifyAuth, (req, res) => {
  res.json({ success: true, user: req.user });
});

// Update Student Profile Avatar
authRouter.put('/profile/avatar', verifyAuth, async (req, res) => {
  try {
    const { studentId, avatarUrl } = req.body;
    const store = db.getStore();
    const profile = store.studentProfiles.find(s => s.id === studentId || s.matricNo === studentId);
    if (profile) {
      profile.avatar = avatarUrl;
    }
    res.json({ success: true, avatarUrl });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update avatar' });
  }
});
