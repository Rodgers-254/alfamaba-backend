// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';

import admin from 'firebase-admin';
import path from 'path';

// ── Firebase Admin Initialization ────────────────────────────
// Derive __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load your service account key JSON (in api/firebase-adminsdk.json)
const serviceAccountPath = path.join(__dirname, 'api', 'firebase-adminsdk.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
});
export const db = admin.firestore();

// ── App Setup ─────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// ── Serve React Frontend ──────────────────────────────────────
const staticDir = resolve(__dirname, 'dist');
app.use(express.static(staticDir));

// ── Health Check ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.send('OK 👍');
});

// ── Existing API Routes ────────────────────────────────────────
const getBookingsPath = resolve(__dirname, 'api/getBookings.js');
const { default: getBookingsHandler } = await import(`file://${getBookingsPath}`);
app.get('/api/bookings', getBookingsHandler);

const postBookingPath = resolve(__dirname, 'api/postBooking.js');
const { default: postBookingHandler } = await import(`file://${postBookingPath}`);
app.post('/api/bookings', postBookingHandler);

import serviceOrdersRouter from './api/serviceOrders.js';
app.use('/api/serviceOrders', serviceOrdersRouter);

const postCareerPath = resolve(__dirname, 'api/postCareerApplication.js');
const { default: postCareerHandler } = await import(`file://${postCareerPath}`);
app.post('/api/career/apply', postCareerHandler);

import careerApplicationsRouter from './api/careerApplications.js';
app.use('/api/career/applications', careerApplicationsRouter);

// ── MPESA STK‑Push & Callback Routes ──────────────────────────
import stkpushRouter from './api/stkpush.js';
import callbackRouter from './api/callback.js';
app.use('/api/mpesa', stkpushRouter);
app.use('/api/mpesa', callbackRouter);

// ── Fallback: Serve index.html for SPA ────────────────────────
app.get('*', (_req, res) => {
  res.sendFile(join(staticDir, 'index.html'));
});

// ── Launch Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
