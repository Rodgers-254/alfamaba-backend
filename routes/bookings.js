// routes/bookings.js
import express from 'express';
import { db } from '../firebaseAdmin.js';
import twilio from 'twilio';

const router = express.Router();

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const fromNumber = `whatsapp:${process.env.TWILIO_FROM}`;
const toNumber = `whatsapp:${process.env.TWILIO_ADMIN}`;

const client = twilio(accountSid, authToken);

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

    const docRef = await db.collection('bookings').add(docData);

    // ✅ Send WhatsApp via Twilio (SAME AS OLD WORKING POST)
    const messageBody = [
      "📦 *New Booking!*",
      `• *Name:* ${name}`,
      `• *Phone:* ${phone}`,
      `• *Date:* ${date} at ${time}`,
      `• *Service:* ${serviceName} — ${subserviceName}`,
      `• *Qty:* ${quantity}`,
      `• *Location:* ${location?.address || `${location.latitude}, ${location.longitude}`}`
    ].join("\n");

    await client.messages.create({
      from: fromNumber,
      to: toNumber,
      body: messageBody,
    });

    return res.status(200).json({ success: true, id: docRef.id });

  } catch (err) {
    console.error('❌ Booking or WhatsApp error:', err.message || err);
    return res.status(500).json({ error: 'Failed to process booking' });
  }
});

export default router;
