import express from 'express';
import { db } from '../db/index.js';
import { verifyAuth, requireRole } from '../middleware/auth.js';

export const messagesRouter = express.Router();

// Get Student Messages (Allowed: Authenticated users)
messagesRouter.get('/', verifyAuth, (req, res) => {
  const store = db.getStore();
  res.json({ success: true, messages: store.consultantMessages });
});

// Mark Single Message as Read
messagesRouter.put('/:id/read', (req, res) => {
  const { id } = req.params;
  const store = db.getStore();
  const msg = store.consultantMessages.find(m => m.id === id);
  if (msg) {
    msg.unread = false;
  }
  res.json({ success: true, messageId: id });
});

// Mark All Messages as Read
messagesRouter.put('/read-all', (req, res) => {
  const store = db.getStore();
  store.consultantMessages.forEach(m => {
    m.unread = false;
  });
  res.json({ success: true });
});

// Send Message from Consultant to Student (Strictly CLINICIAN & ADMIN Only)
messagesRouter.post('/', verifyAuth, requireRole(['CLINICIAN', 'ADMIN']), (req, res) => {
  const { from, role, subject, body, tag, priority, relatedReportId } = req.body;

  const newMessage = {
    id: `MSG-${Date.now().toString().slice(-4)}`,
    from: from || 'Dr. Stella Adeleke (FWACP)',
    role: role || 'Senior Consultant Physician',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150',
    date: 'Just now',
    subject: subject || 'Clinic Advisory Update',
    body,
    unread: true,
    tag: tag || 'Clinical Advisory',
    priority: priority || 'normal',
    relatedReportId: relatedReportId || null
  };

  const store = db.getStore();
  store.consultantMessages.unshift(newMessage);

  res.status(201).json({ success: true, message: newMessage });
});
