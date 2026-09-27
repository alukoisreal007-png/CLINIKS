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

// Root endpoint: friendly dashboard & auto-redirect to frontend Vite dev server
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <title>CLINIKS Backend API</title>
        <meta http-equiv="refresh" content="2;url=http://localhost:5173/" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0F172A; color: #F8FAFC; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: #1E293B; border: 1px solid #334155; padding: 2.5rem 2rem; border-radius: 1rem; max-width: 480px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.4); }
          h1 { color: #699FDF; margin-top: 0; font-size: 1.6rem; letter-spacing: -0.02em; }
          p { color: #94A3B8; font-size: 0.95rem; line-height: 1.6; }
          a.btn { display: inline-block; background: #2563EB; color: white; text-decoration: none; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: bold; margin-top: 1.25rem; font-size: 0.95rem; }
          a.btn:hover { background: #1D4ED8; }
          .sub { font-size: 0.8rem; color: #64748B; margin-top: 1rem; }
          .links { margin-top: 1.5rem; font-size: 0.85rem; color: #64748B; }
          .links a { color: #699FDF; text-decoration: none; margin: 0 0.5rem; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>CLINIKS Clinical API Active</h1>
          <p>You have accessed the backend REST API on port 3001. The interactive web interface is hosted on port <strong>5173</strong>.</p>
          <a class="btn" href="http://localhost:5173/">Open CLINIKS Web App &rarr;</a>
          <p class="sub">Redirecting automatically in 2 seconds...</p>
          <div class="links">
            <a href="/api/health">Health Check</a> &bull;
            <a href="http://localhost:5173/">Frontend Portal</a>
          </div>
        </div>
      </body>
    </html>
  `);
});

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
