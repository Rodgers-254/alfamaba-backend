// routes/bookings.js
import express from 'express';
import { db } from '../firebaseAdmin.js';
import twilio from 'twilio';

const router = express.Router();

// Twilio setup
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER; // e.g. +14155238886 (Twilio sandbox number)
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

    // 🔍 Validate required fields
    if (!name || !phone || !serviceName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 🧾 Build Firestore document
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
      price: typeof price === 'number' ? price : parseInt(price) || 0,
      createdAt: createdAt || new Date().toISOString(),
      status: 'PendingPayment',
    };

    // 💾 Save to Firestore
    const docRef = await db.collection('bookings').add(docData);

    // ✅ Format phone with country code
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

    // 💬 WhatsApp message body
    const smsMessage = `✅ Hi ${name}, your booking for ${subserviceName || serviceName} has been received. We’ll come to ${location?.address || 'your location'} on ${date} at ${time}. Thank you for choosing Alfamaba!`;

    // 📲 Send WhatsApp message
    await twilioClient.messages.create({
      body: smsMessage,
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${formattedPhone}`,
    });

    return res.status(200).json({ success: true, id: docRef.id });
  } catch (err) {
    console.error('❌ Error in /api/bookings:', err?.message || err);
    return res.status(500).json({ error: 'Failed to process booking' });
  }
});

export default router;
