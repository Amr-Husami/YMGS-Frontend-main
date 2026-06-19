import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// POST /api/contact/submit  — public contact form
router.post(
  '/submit',
  asyncHandler(async (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    if (!email && !phone) {
      return res.status(400).json({ success: false, message: 'Email or phone is required' });
    }

    const { error } = await supabase
      .from('contact_messages')
      .insert({ name, email, phone, subject, message });

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Thanks for reaching out — we will get back to you soon.' });
  })
);

// GET /api/contact/list  — submissions (admin)
router.get(
  '/list',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, messages: data });
  })
);

export default router;
