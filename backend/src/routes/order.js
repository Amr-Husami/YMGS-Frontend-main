import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

const ORDER_STATUSES = ['Order Placed', 'Packing', 'Shipped', 'Out for delivery', 'Delivered', 'Cancelled'];

const toClient = (o) => ({
  _id: o.id,
  userId: o.user_id,
  email: o.email,
  items: o.items,
  amount: o.amount,
  originalAmount: o.original_amount,
  address: o.address,
  billingAddress: o.billing_address,
  status: o.status,
  payment: o.payment,
  paymentMethod: o.payment_method,
  manualPaymentDetails: o.manual_payment_details,
  coupon: o.coupon,
  notes: o.notes,
  isGuest: o.is_guest,
  date: o.created_at,
});

// Frontend cart items use `_id`; orders are displayed using `productId`.
const normalizeItems = (items = []) =>
  items.map((it) => ({
    productId: it.productId ?? it._id,
    name: it.name,
    price: it.price,
    image: Array.isArray(it.image) ? it.image[0] : it.image,
    quantity: it.quantity,
    isPackage: it.isPackage ?? false,
  }));

// Build the DB row shared by place / manual / guest.
function buildOrderRow(body, { userId = null, isGuest = false, paymentMethod }) {
  const { items, amount, originalAmount, address, billingAddress, notes, couponCode, manualPaymentDetails } = body;
  const coupon =
    couponCode && originalAmount != null && amount != null
      ? { code: couponCode, discount: Number(originalAmount) - Number(amount) }
      : null;

  return {
    user_id: userId,
    email: address?.email || null,
    items: normalizeItems(items),
    amount,
    original_amount: originalAmount ?? null,
    address: address ?? {},
    billing_address: billingAddress ?? {},
    notes: notes ?? '',
    coupon,
    manual_payment_details: manualPaymentDetails ?? null,
    payment_method: paymentMethod,
    is_guest: isGuest,
    status: 'Order Placed',
    payment: false,
  };
}

function validateOrderBody(body, res) {
  if (!Array.isArray(body.items) || body.items.length === 0) {
    res.status(400).json({ success: false, message: 'items must be a non-empty array' });
    return false;
  }
  if (body.amount == null) {
    res.status(400).json({ success: false, message: 'amount is required' });
    return false;
  }
  return true;
}

async function insertOrder(row, res) {
  const { data, error } = await supabase.from('orders').insert(row).select().single();
  if (error) throw error;
  res.status(201).json({ success: true, order: toClient(data) });
}

// POST /api/order/place  — COD, authenticated
router.post(
  '/place',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!validateOrderBody(req.body, res)) return;
    await insertOrder(buildOrderRow(req.body, { userId: req.user.id, paymentMethod: 'COD' }), res);
  })
);

// POST /api/order/manual  — manual payment (crypto / card / paypal), authenticated
router.post(
  '/manual',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!validateOrderBody(req.body, res)) return;
    await insertOrder(buildOrderRow(req.body, { userId: req.user.id, paymentMethod: 'Manual' }), res);
  })
);

// POST /api/order/guest  — no authentication; tracked by email
router.post(
  '/guest',
  asyncHandler(async (req, res) => {
    if (!validateOrderBody(req.body, res)) return;
    if (!req.body.address?.email) {
      return res.status(400).json({ success: false, message: 'address.email is required for guest orders' });
    }
    const paymentMethod = req.body.manualPaymentDetails ? 'Manual' : 'COD';
    await insertOrder(buildOrderRow(req.body, { isGuest: true, paymentMethod }), res);
  })
);

// POST /api/order/userorders  — orders for the logged-in user (token) OR by email.
// Body: { page, limit, email? }
router.post(
  '/userorders',
  asyncHandler(async (req, res) => {
    const page = Math.max(parseInt(req.body.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.body.limit) || 10, 1), 100);
    const from = (page - 1) * limit;

    // Identify the requester: prefer a valid JWT, otherwise fall back to email.
    const token = req.headers.token || (req.headers.authorization || '').replace(/^Bearer /, '');
    let userId = null;
    if (token) {
      try {
        userId = jwt.verify(token, process.env.JWT_SECRET).id;
      } catch {
        /* ignore invalid token, try email */
      }
    }
    const email = req.body.email;

    if (!userId && !email) {
      return res.status(400).json({ success: false, message: 'Authentication token or email required' });
    }

    let query = supabase.from('orders').select('*', { count: 'exact' });
    query = userId ? query.eq('user_id', userId) : query.eq('email', String(email).toLowerCase().trim());
    query = query.order('created_at', { ascending: false }).range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({
      success: true,
      orders: data.map(toClient),
      pagination: {
        total: count ?? 0,
        pages: Math.ceil((count ?? 0) / limit),
        currentPage: page,
        limit,
      },
    });
  })
);

// POST /api/order/verify-coupon  { couponCode, amount }
router.post(
  '/verify-coupon',
  asyncHandler(async (req, res) => {
    const { couponCode, amount } = req.body;
    if (!couponCode) return res.status(400).json({ success: false, message: 'couponCode is required' });

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.trim())
      .eq('active', true)
      .maybeSingle();

    if (error) throw error;
    if (!coupon) return res.json({ success: false, message: 'Invalid or expired coupon code' });

    const base = Number(amount) || 0;
    const discount =
      coupon.discount_type === 'percent'
        ? Math.round(((base * coupon.discount) / 100) * 100) / 100
        : Math.min(coupon.discount, base);

    res.json({ success: true, couponDetails: { code: coupon.code, discount } });
  })
);

// GET /api/order/settings  — public store settings for footer/contact pages
router.get(
  '/settings',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
    if (error) throw error;

    const s = data || {};
    res.json({
      success: true,
      settings: {
        footerEmail: s.footer_email || '',
        footerPhone: s.footer_phone || '',
        contactEmail: s.contact_email || '',
        contactPhone: s.contact_phone || '',
        contactAddress: s.contact_address || '',
        businessHours: s.business_hours || '',
      },
    });
  })
);

// GET /api/order/crypto-wallets
router.get(
  '/crypto-wallets',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase.from('crypto_wallets').select('*').order('crypto_type');
    if (error) throw error;

    const wallets = (data || []).map((w) => ({
      cryptoType: w.crypto_type,
      network: w.network,
      walletAddress: w.wallet_address,
    }));
    res.json({ success: true, wallets });
  })
);

// --- Admin --------------------------------------------------------------

// GET /api/order/list  — all orders (admin dashboard)
router.get(
  '/list',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, orders: data.map(toClient) });
  })
);

// PUT /api/order/:id/status  — update status / payment (admin)
router.put(
  '/:id/status',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { status, payment } = req.body;
    if (status && !ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Use one of: ${ORDER_STATUSES.join(', ')}` });
    }
    const update = {};
    if (status !== undefined) update.status = status;
    if (payment !== undefined) update.payment = payment;
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ success: false, message: 'Provide status and/or payment' });
    }

    const { data, error } = await supabase
      .from('orders')
      .update(update)
      .eq('id', req.params.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order: toClient(data) });
  })
);

export default router;
