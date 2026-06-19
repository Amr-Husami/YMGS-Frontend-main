import app from './src/app.js';

// Local / traditional-host entry point. (On Vercel, api/index.js is used
// instead and this file is ignored.)
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`YMGS backend listening on http://localhost:${PORT}`);
});
