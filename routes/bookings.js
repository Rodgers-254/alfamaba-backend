// routes/bookings.js
import express from 'express';
import { db } from '../firebaseAdmin.js';
import twilio from 'twilio';

const router = express.Router();

// Load Twilio config
const accountSid    = process.env.TWILIO_SID;
const authToken     = process.env.TWILIO_AUTH_TOKEN;
const fromWhatsApp  = process.env.TWILIO_FROM;    // must be "whatsapp:+14155238886"
const adminWhatsApp = process.env.TWILIO_ADMIN;   // must be "whatsapp:+2547XXXXXXX"

console.log('⚙️ Booking route Twilio config:', {
  accountSid: accountSid ? '***' : undefined,
  authToken: authToken ? '***' : undefined,
  fromWhatsApp,
  adminWhatsApp,
});

const client = twilio(accountSid, authToken);

router.post('/', async (req, res) => {
  console.log('📨 /api/bookings request body:', req.body);

  try {
    const {
      name,
      phone,
      date      = '',
      time      = '',
      quantity  = 1,
      serviceId,
      serviceName,
      subserviceName,
      category   = '',
      location   = null,
      createdAt,
    } = req.body;

    if (!name || !phone || !serviceName || !subserviceName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1) Fetch service & price
    const serviceSnap = await db.collection('services').doc(serviceId).get();
    if (!serviceSnap.exists) {
      return res.status(404).json({ error: 'Service not found' });
    }
    const serviceData = serviceSnap.data();
    const matchedSub = serviceData.subservices?.find(
      s => s.name.toLowerCase() === subserviceName.toLowerCase()
    );
    const price = matchedSub?.price || 0;

    // 2) Save booking
    const bookingData = {
      name,
      phone,
      date,
      time,
      quantity,
      serviceId,
      serviceName,
      subserviceName,
      category,
      location,
      price,
      createdAt: createdAt || new Date().toISOString(),
      status: 'PendingPayment',
    };
    const docRef = await db.collection('bookings').add(bookingData);
    console.log('✅ Booking saved with ID:', docRef.id);

    // 3) Send WhatsApp
    if (!fromWhatsApp || !adminWhatsApp) {
      console.warn('⚠️ Twilio WhatsApp numbers not set; skipping message send.');
      return res.json({ success: true, id: docRef.id, messageSent: false });
    }

    const messageBody = [
      `📦 *New Booking*`,
      `👤 Name: ${name}`,
      `📞 Phone: ${phone}`,
      `💈 Service: ${serviceName} > ${subserviceName}`,
      `📅 Date: ${date || 'N/A'}`,
      `⏰ Time: ${time || 'N/A'}`,
      `🔢 Qty: ${quantity}`,
      `💰 Price: KES ${price}`,
      `📍 Location: ${location?.address || JSON.stringify(location) || 'N/A'}`
    ].join('\n');

    console.log('📤 Sending WhatsApp:', { from: fromWhatsApp, to: adminWhatsApp, body: messageBody });

    // **Force errors to surface**
    const twResp = await client.messages.create({
      from: fromWhatsApp,
      to:   adminWhatsApp,
      body: messageBody,
    });
    console.log('✅ Twilio response SID:', twResp.sid);

    // 4) Respond with messageSent flag
    return res.json({ success: true, id: docRef.id, messageSent: true });
  }
  catch (err) {
    console.error('❌ /api/bookings error:', err);
    // Return the Twilio or other error to the frontend
    return res.status(500).json({
      error: 'Internal server error',
      details: err.message
    });
  }
});

export default router;
