// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// ── Firebase Admin Init (your existing code) ───────────────────────
import admin from 'firebase-admin';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceAccountPath = path.join(__dirname, 'routes', 'firebase-adminsdk.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
});
export const db = admin.firestore();

// ── Handlers ────────────────────────────────────────────────────────
// your postBooking.js and getBookings.js live in ./routes
import bookingsRouter from './routes/bookings.js';           // handles POST /api/bookings, GET /api/bookings
import serviceOrdersRouter from './routes/serviceOrders.js'; // handles POST /api/serviceOrders

// ── App Setup ───────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// ── API Mounts ──────────────────────────────────────────────────────
app.use('/api/bookings', bookingsRouter);
app.use('/api/serviceOrders', serviceOrdersRouter);

// ── Health Check & SPA Fallback ────────────────────────────────────
app.get('/api/health', (_req, res) => res.send('OK 🚀'));

// If you also serve a React build, un-comment & adjust the following:
// const staticDir = path.join(__dirname, 'dist');
// app.use(express.static(staticDir));
// app.get('*', (_req, res) => res.sendFile(path.join(staticDir, 'index.html')));

// ── Start Server ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
