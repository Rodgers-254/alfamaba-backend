// api/postBooking.js
import 'dotenv/config';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore }        from 'firebase-admin/firestore';
import twilio                  from 'twilio';

if (!global.firebaseAdminInit) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_JSON);
  initializeApp({ credential: cert(serviceAccount) });
  global.firebaseAdminInit = true;
}
const db = getFirestore();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }
  try {
    const { name, phone, date, time, serviceName, subserviceName, category, location } = req.body;
    const loc = location.address
      ? { address: location.address }
      : { latitude: location.latitude, longitude: location.longitude };

    const docRef = await db.collection('bookings').add({
      name, phone, date, time,
      serviceName, subserviceName, category,
      location: loc,
      createdAt: new Date().toISOString(),
    });

    const messageBody =
      `📦 New booking (${docRef.id}):\n` +
      `👤 ${name} • ${phone}\n` +
      `💇 ${serviceName} > ${subserviceName}\n` +
      `📂 Category: ${category}\n` +
      `🗓 ${date} @ ${time}\n` +
      `📍 ${loc.address ?? `${loc.latitude},${loc.longitude}`}`;

    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_FROM}`,
      to:   `whatsapp:${process.env.TWILIO_ADMIN}`,
      body: messageBody,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error processing booking:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
