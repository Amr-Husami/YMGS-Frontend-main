import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

async function listAddresses(userId) {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({ ...row.data, _id: row.id }));
}

// GET /api/address/get
router.get(
  '/get',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ success: true, addresses: await listAddresses(req.user.id) });
  })
);

// POST /api/address/save  { address }
router.post(
  '/save',
  requireAuth,
  asyncHandler(async (req, res) => {
    const address = req.body.address;
    if (!address || typeof address !== 'object') {
      return res.status(400).json({ success: false, message: 'address object is required' });
    }
    const { error } = await supabase.from('addresses').insert({ user_id: req.user.id, data: address });
    if (error) throw error;

    res.status(201).json({ success: true, addresses: await listAddresses(req.user.id) });
  })
);

export default router;
