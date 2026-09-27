import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.js';
import { triageRouter } from './routes/triage.js';
import { recordsRouter } from './routes/records.js';
import { messagesRouter } from './routes/messages.js';
import { db } from './db/index.js';

import path from 'path';

// Support .env in root or server directory
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*', // Allow Vite client on any port (5173, etc.)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/triage', triageRouter);
app.use('/api/records', recordsRouter);
app.use('/api/messages', messagesRouter);

// System Health & Engine Diagnostics
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'CLINIKS University Clinical API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: {
      driver: db.isPostgres() ? 'PostgreSQL' : 'In-Memory Persistence Store',
      status: 'CONNECTED'
    },
    aiEngine: {
      llmProvider: process.env.GEMINI_API_KEY ? 'Google Gemini 1.5 Flash' : 'Clinical Heuristics (Set GEMINI_API_KEY for live LLM)',
      status: 'READY'
    }
  });
});

// Start Server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🚀 CLINIKS Backend API running at http://localhost:${PORT}`);
  console.log(`📡 Database Mode: ${db.isPostgres() ? 'PostgreSQL' : 'In-Memory Persistent Store'}`);
  console.log(`🧠 AI Engine:     ${process.env.GEMINI_API_KEY ? 'Google Gemini LLM' : 'Clinical Heuristics'}`);
  console.log(`🩺 Healthcheck:   http://localhost:${PORT}/api/health`);
  console.log(`======================================================\n`);
});

export default app;
