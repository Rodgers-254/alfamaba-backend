// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

//
// ─── FIREBASE ADMIN INIT FROM ENV ───────────────────────────────────────
//
if (!process.env.FIREBASE_ADMIN_JSON) {
  console.error('❌ Missing FIREBASE_ADMIN_JSON env‑var');
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_JSON);
} catch (err) {
  console.error('❌ Failed to parse FIREBASE_ADMIN_JSON:', err);
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount),
});

export const db = getFirestore();

//
// ─── ROUTES ─────────────────────────────────────────────────────────────
//
import bookingsRouter from './routes/bookings.js';           // handles GET/POST /api/bookings
import serviceOrdersRouter from './routes/serviceOrders.js'; // handles POST /api/serviceOrders

//
// ─── APP SETUP ─────────────────────────────────────────────────────────
//
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/bookings', bookingsRouter);
app.use('/api/serviceOrders', serviceOrdersRouter);

// health check
app.get('/api/health', (_req, res) => res.send('OK 🚀'));

//
// ─── START SERVER ──────────────────────────────────────────────────────
//
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
