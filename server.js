// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { db } from './firebaseAdmin.js'; // ✅ Corrected: importing db directly from root-level firebaseAdmin.js

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
