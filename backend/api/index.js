// Vercel serverless entry point. An Express app is itself a (req, res)
// handler, so exporting it works as a Vercel Node function. All routes are
// directed here by vercel.json.
import app from '../src/app.js';

export default app;
