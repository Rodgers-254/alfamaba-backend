// routes/bookings.js
import express from 'express';
import { db } from '../firebaseAdmin.js';
import twilio from 'twilio';

const router = express.Router();

// ✅ Twilio config from environment variables
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const twilioFrom = process.env.TWILIO_FROM; // e.g. 'whatsapp:+14155238886'
const twilioAdmin = process.env.TWILIO_ADMIN; // e.g. 'whatsapp:+254116560425'

const client = twilio(accountSid, authToken);

// POST /api/bookings — create a new booking & send WhatsApp
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

    if (!name || !phone || !serviceName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

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

    // Save to Firestore
    const docRef = await db.collection('bookings').add(docData);

    // Build WhatsApp message
    const message = [
      '📦 *New Booking!*',
      `• *Name:* ${name}`,
      `• *Phone:* ${phone}`,
      `• *When:* ${date} @ ${time}`,
      `• *Service:* ${serviceName} — ${subserviceName}`,
      `• *Location:* ${
        location?.address || `${location?.latitude}, ${location?.longitude}`
      }`,
    ].join('\n');

    // Send WhatsApp message
    await client.messages.create({
      from: twilioFrom,
      to: twilioAdmin,
      body: message,
    });

    console.log('✅ WhatsApp message sent to admin.');
    return res.status(200).json({ success: true, id: docRef.id });

  } catch (err) {
    console.error('❌ Booking or WhatsApp error:', err.message);
    return res.status(500).json({ error: 'Booking failed' });
  }
});

export default router;
