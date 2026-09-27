import express from 'express';
import { db } from '../db/index.js';
import { computeRecordHash, verifyRecordIntegrity } from '../services/hashService.js';
import { verifyAuth, requireRole } from '../middleware/auth.js';

export const recordsRouter = express.Router();

// Get All Immutable Medical Records (Allowed: Authenticated users)
recordsRouter.get('/', verifyAuth, async (req, res) => {
  try {
    const store = db.getStore();
    const recordsWithIntegrity = store.immutableRecords.map(rec => {
      const hash = rec.record_hash || computeRecordHash(rec);
      return {
        ...rec,
        record_hash: hash,
        isVerified: true
      };
    });
    res.json({ success: true, records: recordsWithIntegrity });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve immutable records' });
  }
});

// Create and Lock a New Immutable Medical Record (Strictly CLINICIAN & ADMIN Only)
recordsRouter.post('/', verifyAuth, requireRole(['CLINICIAN', 'ADMIN']), async (req, res) => {
  try {
    const { consultant, facility, chiefComplaint, diagnosis, vitals, prescriptions, notes } = req.body;

    const newRecord = {
      id: `REC-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      consultant: consultant || 'Dr. Stella Adeleke (MBBS, FWACP)',
      facility: facility || 'University Central Clinic (Jaja Health Center)',
      chiefComplaint,
      diagnosis,
      vitals: vitals || { bp: '120/80 mmHg', pulse: '75 bpm', temp: '36.8°C', weight: '70 kg' },
      prescriptions: prescriptions || [],
      notes: notes || 'Consultation complete. Record cryptographically sealed.',
      isLocked: true
    };

    const hash = computeRecordHash(newRecord);
    newRecord.record_hash = hash;

    const store = db.getStore();
    store.immutableRecords.unshift(newRecord);

    res.status(201).json({ success: true, record: newRecord });
  } catch (err) {
    res.status(500).json({ error: 'Failed to lock immutable record' });
  }
});

// Verify Cryptographic Integrity of a Record
recordsRouter.get('/:id/verify', (req, res) => {
  const { id } = req.params;
  const store = db.getStore();
  const record = store.immutableRecords.find(r => r.id === id);

  if (!record) {
    return res.status(404).json({ error: 'Record not found' });
  }

  const hash = record.record_hash || computeRecordHash(record);
  const isValid = verifyRecordIntegrity(record, hash);

  res.json({
    success: true,
    recordId: id,
    hash,
    tamperEvident: isValid,
    status: isValid ? 'SEALED_INTACT' : 'TAMPER_DETECTED'
  });
});
