import { Router } from 'express';
import multer from 'multer';
import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// --- Image uploads (Supabase Storage) ---------------------------------------
const BUCKET = 'product-images';
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB per file (stays under Vercel's request limit)
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Only image files are allowed')),
});

// Create the public bucket on first use.
let bucketReady = false;
async function ensureBucket() {
  if (bucketReady) return;
  const { data } = await supabase.storage.getBucket(BUCKET);
  if (!data) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (error && !/already exists/i.test(error.message)) throw error;
  }
  bucketReady = true;
}

// DB row -> shape the frontend expects (_id, subCategory, ...).
const toClient = (p) => ({
  _id: p.id,
  name: p.name,
  description: p.description,
  price: p.price,
  image: p.image,
  category: p.category,
  subCategory: p.sub_category,
  bestseller: p.bestseller,
  minOrderQuantity: p.min_order_quantity,
  stock: p.stock,
  date: p.created_at,
});

// Accept both client (subCategory) and DB (sub_category) field names on writes.
const toRow = (b) => ({
  name: b.name,
  description: b.description,
  price: b.price,
  image: b.image,
  category: b.category,
  sub_category: b.subCategory ?? b.sub_category,
  bestseller: b.bestseller,
  min_order_quantity: b.minOrderQuantity ?? b.min_order_quantity,
  stock: b.stock,
});

const compact = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

// POST /api/product/user/list  — storefront listing with filters + pagination.
// Body: { page, limit, category, subCategory, search, bestseller, sortBy, sortOrder, excludeId }
// category / subCategory may be a string or an array of strings.
router.post(
  '/user/list',
  asyncHandler(async (req, res) => {
    const body = req.body || {};
    const page = Math.max(parseInt(body.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(body.limit) || 20, 1), 100);
    const from = (page - 1) * limit;
    const { category, subCategory, search, bestseller, excludeId, sortBy = 'date', sortOrder = 'desc' } = body;

    let query = supabase.from('products').select('*', { count: 'exact' });

    const applyFilter = (column, value) => {
      if (Array.isArray(value)) {
        if (value.length) query = query.in(column, value);
      } else if (value !== undefined && value !== null && value !== '') {
        query = query.eq(column, value);
      }
    };
    applyFilter('category', category);
    applyFilter('sub_category', subCategory);

    if (bestseller === true || bestseller === 'true') query = query.eq('bestseller', true);
    if (excludeId) query = query.neq('id', excludeId);
    if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);

    const sortColumn = sortBy === 'price' ? 'price' : sortBy === 'name' ? 'name' : 'created_at';
    query = query.order(sortColumn, { ascending: sortOrder === 'asc' }).range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({
      success: true,
      products: data.map(toClient),
      pagination: {
        total: count ?? 0,
        pages: Math.ceil((count ?? 0) / limit),
        currentPage: page,
        limit,
      },
    });
  })
);

// GET /api/product/filters — distinct categories & sub-categories actually in
// use, so the storefront filter UI always matches real data.
router.get(
  '/filters',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase.from('products').select('category, sub_category');
    if (error) throw error;

    const categories = [...new Set(data.map((p) => p.category).filter(Boolean))].sort();
    const subCategories = [...new Set(data.map((p) => p.sub_category).filter(Boolean))].sort();

    res.json({ success: true, categories, subCategories });
  })
);

// POST /api/product/add  (admin)
router.post(
  '/add',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    if (!req.body.name) {
      return res.status(400).json({ success: false, message: 'name is required' });
    }
    const { data, error } = await supabase
      .from('products')
      .insert(compact(toRow(req.body)))
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, product: toClient(data) });
  })
);

// POST /api/product/upload  (admin) — multipart form-data, field name "images".
// Returns { success, urls: [...] } of the uploaded image public URLs.
router.post(
  '/upload',
  requireAuth,
  requireAdmin,
  upload.array('images', 6),
  asyncHandler(async (req, res) => {
    if (!req.files?.length) {
      return res.status(400).json({ success: false, message: 'No image files received' });
    }
    await ensureBucket();

    const urls = [];
    for (const file of req.files) {
      const ext = (file.originalname.split('.').pop() || 'jpg').toLowerCase();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file.buffer, { contentType: file.mimetype, upsert: false });
      if (error) throw error;
      urls.push(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
    }
    res.json({ success: true, urls });
  })
);

// GET /api/product/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product: toClient(data) });
  })
);

// PUT /api/product/:id  (admin)
router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('products')
      .update(compact(toRow(req.body)))
      .eq('id', req.params.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product: toClient(data) });
  })
);

// DELETE /api/product/:id  (admin)
router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  })
);

export default router;
