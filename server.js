// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import admin from 'firebase-admin';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// initialize firebase-admin
const serviceAccountPath = path.join(__dirname, 'routes', 'firebase-adminsdk.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
});
export const db = admin.firestore();

import bookingsRouter from './routes/bookings.js';
import serviceOrdersRouter from './routes/serviceOrders.js';

const app = express();
app.use(cors());
app.use(express.json());

// mount APIs
app.use('/api/bookings', bookingsRouter);
app.use('/api/serviceOrders', serviceOrdersRouter);

// health check
app.get('/api/health', (_req, res) => res.send('OK 🚀'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
