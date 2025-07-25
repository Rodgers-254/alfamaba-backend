// backend/routes/bookings.js
import express from 'express';
import twilio from 'twilio';
import { db } from '../firebaseconfig.js';                   // your admin‑initialized Firestore
import { collection, addDoc } from 'firebase-admin/firestore';

const router = express.Router();

// Twilio client
const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_TOKEN
);

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
      price = 0
    } = req.body;

    // Validate required fields
    if (!name || !phone || !serviceName || !subserviceName) {
      return res.status(400).json({ error: 'Missing required booking fields' });
    }

    // Prepare Firestore document
    const createdAt = new Date().toISOString();
    const docData = {
      name,
      phone,
      date: date || '',
      time: time || '',
      quantity,
      serviceId: serviceId || '',
      serviceName,
      subserviceName,
      category: category || '',
      price,
      location,         // { address } or { latitude, longitude }
      createdAt
    };

    // Save to Firestore
    const docRef = await addDoc(collection(db, 'bookings'), docData);

    // Compose WhatsApp message
    const locationDesc = location.address
      ? location.address
      : `Lat ${location.latitude}, Lng ${location.longitude}`;

    const messageBody = 
      `✂️ New Booking (${docRef.id}):\n` +
      `Name: ${name}\n` +
      `Phone: ${phone}\n` +
      `Service: ${serviceName} → ${subserviceName}\n` +
      `Quantity: ${quantity} @ KES ${price}\n` +
      `When: ${date} @ ${time}\n` +
      `Where: ${locationDesc}`;

    // Send via Twilio WhatsApp
    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_FROM}`,
      to:   `whatsapp:${process.env.TWILIO_ADMIN}`,
      body: messageBody
    });

    // Respond to the client
    return res.status(200).json({ success: true, id: docRef.id });
  } catch (err) {
    console.error('Booking handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
