import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// The cart is stored as a JSON map { itemId: cartData } on the user row.
async function getCart(userId) {
  const { data, error } = await supabase.from('users').select('cart').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data?.cart || {};
}

async function saveCart(userId, cart) {
  const { error } = await supabase.from('users').update({ cart }).eq('id', userId);
  if (error) throw error;
}

// POST /api/cart/add  { itemId, cartData }
router.post(
  '/add',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { itemId, cartData } = req.body;
    if (!itemId) return res.status(400).json({ success: false, message: 'itemId is required' });

    const cart = await getCart(req.user.id);
    cart[itemId] = cartData ?? { quantity: 1 };
    await saveCart(req.user.id, cart);

    res.json({ success: true, cartData: cart });
  })
);

// POST /api/cart/update  { itemId, cartData }  (quantity 0 removes the item)
router.post(
  '/update',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { itemId, cartData } = req.body;
    if (!itemId) return res.status(400).json({ success: false, message: 'itemId is required' });

    const cart = await getCart(req.user.id);
    if (!cartData || !cartData.quantity || Number(cartData.quantity) <= 0) {
      delete cart[itemId];
    } else {
      cart[itemId] = cartData;
    }
    await saveCart(req.user.id, cart);

    res.json({ success: true, cartData: cart });
  })
);

// POST /api/cart/get
router.post(
  '/get',
  requireAuth,
  asyncHandler(async (req, res) => {
    const cart = await getCart(req.user.id);
    res.json({ success: true, cartData: cart });
  })
);

export default router;
