// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';

const app = express();
app.use(cors());
app.use(express.json());

// ── ESM __dirname ─────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Serve React build ─────────────────────────────────────────
const staticDir = resolve(__dirname, 'dist');
app.use(express.static(staticDir));

// ── Health check ───────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.send('OK 👍');
});

// ── Bookings endpoints ─────────────────────────────────────────
const getBookingsPath  = resolve(__dirname, 'api/getBookings.js');
const { default: getBookingsHandler } = await import(`file://${getBookingsPath}`);
app.get('/api/bookings', getBookingsHandler);

const postBookingPath = resolve(__dirname, 'api/postBooking.js');
const { default: postBookingHandler } = await import(`file://${postBookingPath}`);
app.post('/api/bookings', postBookingHandler);

// ── Service‐orders router (fix this!) ─────────────────────────
import serviceOrdersRouter from './api/serviceOrders.js';
app.use('/api/serviceOrders', serviceOrdersRouter);

// ── SPA fallback ───────────────────────────────────────────────
app.get('*', (_req, res) => {
  res.sendFile(join(staticDir, 'index.html'));
});

// ── Start server ───────────────────────────────────────────────
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});
