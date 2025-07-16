// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';

// Express init
const app = express();
app.use(cors());
app.use(express.json());

// ── Setup __dirname for ESM ────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── 0) Serve built React app ───────────────────────────────
const staticDir = resolve(__dirname, 'dist');
app.use(express.static(staticDir));

// ── 1) Health check ────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.send('OK 👍');
});

// ── 2) GET /api/bookings ───────────────────────────────────
const getBookingsPath = resolve(__dirname, 'api/getBookings.js');
const { default: getBookingsHandler } = await import(`file://${getBookingsPath}`);
app.get('/api/bookings', getBookingsHandler);

// ── 3) POST /api/bookings ──────────────────────────────────
const postBookingPath = resolve(__dirname, 'api/postBooking.js');
const { default: postBookingHandler } = await import(`file://${postBookingPath}`);
app.post('/api/bookings', postBookingHandler);

// ── ✅ 4) Add full /api/serviceOrders router ───────────────
import serviceOrdersRouter from './api/serviceOrders.js';
app.use('/api/serviceOrders', serviceOrdersRouter);  // <-- this line connects it

// ── 5) SPA fallback ────────────────────────────────────────
app.get('*', (_req, res) => {
  res.sendFile(join(staticDir, 'index.html'));
});

// ── 6) Start server ────────────────────────────────────────
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});
