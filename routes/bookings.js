// routes/bookings.js
import express from 'express';
import { db } from '../firebaseAdmin.js';
import admin from 'firebase-admin';
import twilio from 'twilio';

const router = express.Router();

// 🔐 Twilio config from environment
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromWhatsApp = process.env.TWILIO_FROM; // e.g. 'whatsapp:+14155238886'
const adminWhatsApp = process.env.TWILIO_ADMIN; // e.g. 'whatsapp:+2547xxxxxxx'

// Debug log to verify env vars
console.log('Twilio Config:', {
  accountSid,
  authToken: authToken ? '***' : undefined,
  fromWhatsApp,
  adminWhatsApp,
});

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
      createdAt,
    } = req.body;

    if (!name || !phone || !serviceName || !subserviceName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const serviceRef = db.collection('services').doc(serviceId);
    const serviceSnap = await serviceRef.get();

    if (!serviceSnap.exists) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const serviceData = serviceSnap.data();

    const matchedSub = serviceData.subservices?.find(
      s => s.name.toLowerCase() === subserviceName.toLowerCase()
    );

    const price = matchedSub?.price || 0;

    const docData = {
      name,
      phone,
      date: date || '',
      time: time || '',
      quantity,
      serviceId,
      serviceName,
      subserviceName,
      category: category || '',
      location: location || null,
      price,
      createdAt: createdAt || new Date().toISOString(),
      status: 'PendingPayment',
    };

    const docRef = await db.collection('bookings').add(docData);

    // ✅ Send WhatsApp message to admin (only if config is valid)
    const messageBody = `📦 New Booking:\nName: ${name}\nPhone: ${phone}\nService: ${serviceName} > ${subserviceName}\nDate: ${date || 'N/A'}\nTime: ${time || 'N/A'}\nQty: ${quantity}\nPrice: KES ${price}\nLocation: ${location?.address || 'N/A'}`;

    if (!fromWhatsApp || !adminWhatsApp) {
      console.warn('🚫 Missing Twilio WhatsApp numbers. Message not sent.');
    } else {
      try {
        await client.messages.create({
          body: messageBody,
          from: fromWhatsApp,
          to: adminWhatsApp,
        });
        console.log('✅ WhatsApp message sent to admin.');
      } catch (twilioErr) {
        console.error('❌ Twilio message error:', twilioErr.message);
      }
    }

    return res.status(200).json({ success: true, id: docRef.id });
  } catch (err) {
    console.error('❌ Error creating booking:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
