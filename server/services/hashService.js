import crypto from 'crypto';

/**
 * Computes a SHA-256 hash for an immutable medical record to guarantee tamper-proof integrity.
 * @param {Object} record - The clinical record data
 * @returns {string} SHA-256 hexadecimal hash
 */
export function computeRecordHash(record) {
  const payload = JSON.stringify({
    studentId: record.studentId || record.student_id,
    consultant: record.consultant || record.consultant_name,
    diagnosis: record.diagnosis,
    vitals: record.vitals,
    prescriptions: record.prescriptions,
    createdAt: record.date || record.created_at
  });

  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Verifies whether a given record matches its stored cryptographic hash.
 * @param {Object} record - The record to verify
 * @param {string} storedHash - The hash to compare against
 * @returns {boolean} True if intact, false if tampered with
 */
export function verifyRecordIntegrity(record, storedHash) {
  const recalculated = computeRecordHash(record);
  return recalculated === storedHash;
}
