import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import userRoutes from './routes/user.js';
import productRoutes from './routes/product.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/order.js';
import addressRoutes from './routes/address.js';
import blogRoutes from './routes/blog.js';
import contactRoutes from './routes/contact.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

// --- CORS: allow the configured frontend origins ---------------------------
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser tools (curl/Postman) which send no Origin header,
      // and any explicitly allow-listed origin. Empty list = allow all.
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// --- Routes ----------------------------------------------------------------
app.get('/', (req, res) => res.json({ success: true, message: 'YMGS API is running' }));
app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok' }));

app.use('/api/user', userRoutes);
app.use('/api/product', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/contact', contactRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
