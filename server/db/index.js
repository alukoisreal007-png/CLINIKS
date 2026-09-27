import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { initialStudentProfile, initialTriageQueue, initialImmutableRecords, initialConsultantMessages } from '../../src/data/mockData.js';

dotenv.config();

let pool = null;
let usePostgres = false;

// In-Memory store fallback if DATABASE_URL is not provided or Postgres is offline
const inMemoryStore = {
  users: [],
  studentProfiles: [initialStudentProfile],
  triageCases: [...initialTriageQueue],
  immutableRecords: [...initialImmutableRecords],
  consultantMessages: [...initialConsultantMessages]
};

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    pool.query('SELECT NOW()', (err, res) => {
      if (err) {
        console.warn('⚠️  PostgreSQL connection failed. Falling back to active in-memory store.');
        console.warn('   Reason:', err.message);
        usePostgres = false;
      } else {
        console.log('✅ PostgreSQL Connected successfully:', res.rows[0].now);
        usePostgres = true;
      }
    });
  } catch (err) {
    console.warn('⚠️  PostgreSQL initialization failed. Using in-memory store.');
    usePostgres = false;
  }
} else {
  console.log('ℹ️  No DATABASE_URL configured. Running with in-memory persistence store.');
}

export const db = {
  isPostgres: () => usePostgres,
  getPool: () => pool,
  getStore: () => inMemoryStore,

  query: async (text, params) => {
    if (usePostgres && pool) {
      return pool.query(text, params);
    }
    throw new Error('PostgreSQL query called but running in in-memory mode.');
  }
};
