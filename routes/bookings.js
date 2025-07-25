// routes/bookings.js

import express from 'express';
import { db } from '../firebaseAdmin.js'; // Using Firebase Admin SDK
import twilio from 'twilio';

const router = express.Router();

// ✅ Load Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

// ✅ Initialize Twilio client
const twilioClient = twilio(accountSid, authToken);

// POST /api/bookings — create a new booking
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
      createdAt,
    } = req.body;

    // Basic validation
    if (!name || !phone || !serviceName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Construct booking data
    const docData = {
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
      price: typeof price === 'number' ? price : 0,
      createdAt: createdAt || new Date().toISOString(),
      status: 'PendingPayment',
    };

    // 🔥 Save booking to Firestore
    const docRef = await db.collection('bookings').add(docData);

    // 📨 Send SMS with Twilio
    const smsMessage = `Hi ${name}, your booking for ${subserviceName || serviceName} has been received and scheduled for ${date} at ${time}.`;

    const formattedPhone = phone.startsWith('+')
      ? phone
      : `+254${phone.slice(-9)}`; // Formats Kenyan numbers

    await twilioClient.messages.create({
      body: smsMessage,
      from: twilioPhone,
      to: formattedPhone,
    });

    return res.status(200).json({ success: true, id: docRef.id });
  } catch (err) {
    console.error('❌ Booking error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/bookings — list bookings
router.get('/', async (_req, res) => {
  try {
    const snap = await db.collection('bookings').orderBy('createdAt', 'desc').get();
    const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json({ success: true, bookings: list });
  } catch (err) {
    console.error('❌ Error fetching bookings:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
