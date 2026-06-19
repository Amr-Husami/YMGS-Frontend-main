// Single-project deployment: the backend Express app runs as a Vercel
// serverless function on the SAME domain as the storefront, under /api/*.
// (vercel.json routes /api/* here.)
import app from '../backend/src/app.js';

export default app;
