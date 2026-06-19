import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

const toClient = (b) => ({
  _id: b.id,
  title: b.title,
  content: b.content,
  image: b.image,
  author: b.author,
  createdAt: b.created_at,
});

// GET /api/blog/list?page=&limit=
router.get(
  '/list',
  asyncHandler(async (req, res) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 9, 1), 100);
    const from = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('blogs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (error) throw error;

    res.json({
      success: true,
      blogs: data.map(toClient),
      pagination: {
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
        currentPage: page,
        limit,
      },
    });
  })
);

// POST /api/blog/add  (admin)
router.post(
  '/add',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { title, content, image, author } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'title is required' });

    const { data, error } = await supabase
      .from('blogs')
      .insert({ title, content: content ?? '', image: image ?? '', author: author ?? '' })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, blog: toClient(data) });
  })
);

// GET /api/blog/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json({ success: true, blog: toClient(data) });
  })
);

// DELETE /api/blog/:id  (admin)
router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', req.params.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json({ success: true, message: 'Blog deleted' });
  })
);

export default router;
