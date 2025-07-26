// routes/bookings.js
import express from 'express';
import { db } from '../firebaseAdmin.js';
import twilio from 'twilio';

const router = express.Router();

// ✅ Twilio Setup
const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const twilioFrom = process.env.TWILIO_FROM;      // e.g. 'whatsapp:+14155238886'
const twilioAdmin = process.env.TWILIO_ADMIN;    // e.g. 'whatsapp:+2547xxxxxxx'

// POST /api/bookings
router.post('/', async (req, res) => {
  try {
    const {
      name,
      phone,
      date,
      time,
      quantity = 1,
      serviceId,
      serviceName,
      subserviceName,
      category,
      location,
      price,
      createdAt
    } = req.body;

    // Basic validation
    if (!name || !phone || !serviceName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const bookingData = {
      name,
      phone,
      date: date || '',
      time: time || '',
      quantity,
      serviceId: serviceId || '',
      serviceName,
      subserviceName: subserviceName || '',
      category: category || '',
      location: location || null,
      price: typeof price === 'number' ? price : Number(price) || 0,
      createdAt: createdAt || new Date().toISOString(),
      status: 'PendingPayment'
    };

    // 🔥 1. Save to Firestore
    const docRef = await db.collection('bookings').add(bookingData);

    // 💬 2. Send WhatsApp message via Twilio
    const messageBody = `
📦 *New Booking!*
• *Name:* ${name}
• *Phone:* ${phone}
• *When:* ${date} @ ${time}
• *Service:* ${serviceName} — ${subserviceName}
• *Location:* ${
      location?.address ||
      `${location?.latitude}, ${location?.longitude}`
    }`;

    await client.messages.create({
      from: `whatsapp:${twilioFrom}`,
      to: `whatsapp:${twilioAdmin}`,
      body: messageBody,
    });

    // ✅ Return success
    return res.status(200).json({ success: true, id: docRef.id });

  } catch (err) {
    console.error('🔥 Error in /api/bookings:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/bookings — list all
router.get('/', async (_req, res) => {
  try {
    const snap = await db.collection('bookings').orderBy('createdAt', 'desc').get();
    const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json({ success: true, bookings: list });
  } catch (err) {
    console.error('Error fetching bookings:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
