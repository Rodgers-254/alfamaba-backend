// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// ── Firebase Admin Initialization ────────────────────────────────
import admin from 'firebase-admin';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Point to your service account JSON inside routes/
const serviceAccountPath = path.join(__dirname, 'routes', 'firebase-adminsdk.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
});
export const db = admin.firestore();

// ── Import your routers ───────────────────────────────────────────
import bookingsRouter from './routes/bookings.js';           // POST & GET /api/bookings
import serviceOrdersRouter from './routes/serviceOrders.js'; // POST /api/serviceOrders

// ── Create Express App ───────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// ── Mount API Routes ──────────────────────────────────────────────
app.use('/api/bookings', bookingsRouter);
app.use('/api/serviceOrders', serviceOrdersRouter);

// ── Health Check ──────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.send('OK 🚀'));

// ── (Optional) Serve React Build ─────────────────────────────────
// const staticDir = path.join(__dirname, 'dist');
// app.use(express.static(staticDir));
// app.get('*', (_req, res) => res.sendFile(path.join(staticDir, 'index.html')));

// ── Start Server ──────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
