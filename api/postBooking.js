// api/bookings.js
import dotenv from 'dotenv';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import twilio from 'twilio';

// Enable __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ Load .env from root
dotenv.config({ path: resolve(__dirname, '../.env') });

// 1. Firebase Admin init
if (!global.firebaseAdminInit) {
  const saPath = resolve(__dirname, './firebase-adminsdk.json');
  const serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));
  initializeApp({ credential: cert(serviceAccount) });
  global.firebaseAdminInit = true;
}
const db = getFirestore();

// 2. Init Twilio
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

// Debug env
console.log('🔑 Twilio ENV Vars:');
console.log('  SID   =', process.env.TWILIO_SID?.slice(0, 5) + '...');
console.log('  TOKEN =', process.env.TWILIO_TOKEN?.slice(0, 5) + '...');
console.log('  FROM  =', process.env.TWILIO_FROM);
console.log('  ADMIN =', process.env.TWILIO_ADMIN);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const {
      name,
      phone,
      date,
      time,
      serviceName,
      subserviceName,
      category,
      location: { address, latitude, longitude },
    } = req.body;

    const docRef = await db.collection('bookings').add({
      name,
      phone,
      date,
      time,
      serviceName,
      subserviceName,
      category,
      location: address ? { address } : { latitude, longitude },
      createdAt: new Date().toISOString(),
    });

    console.log('✅ Booking saved to Firestore with ID:', docRef.id);

    const messageBody =
      `📦 New booking (${docRef.id}):\n` +
      `👤 ${name} • ${phone}\n` +
      `💇 ${serviceName} > ${subserviceName}\n` +
      `📂 Category: ${category}\n` +
      `🗓 ${date} @ ${time}\n` +
      `📍 ${address ?? `${latitude},${longitude}`}`;

    const payload = {
      from: `whatsapp:${process.env.TWILIO_FROM}`,
      to: `whatsapp:${process.env.TWILIO_ADMIN}`,
      body: messageBody,
    };

    console.log('📤 Sending WhatsApp message:', payload);
    const twilioRes = await client.messages.create(payload);
    console.log('✅ WhatsApp message sent! SID:', twilioRes.sid);

    return res.status(200).json({ success: true, message: 'Booking logged!' });
  } catch (err) {
    console.error('❌ Error while processing booking:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
