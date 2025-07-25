// routes/bookings.js
import express from 'express';
import { db } from '../firebaseAdmin.js'; // ✅ admin SDK
import twilio from 'twilio';

const router = express.Router();

// ✅ Twilio config
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const fromNumber = process.env.TWILIO_FROM_NUMBER;

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
      price: typeof price === 'number' ? price : parseFloat(price) || 0,
      createdAt: createdAt || new Date().toISOString(),
      status: 'PendingPayment',
    };

    // Save to Firestore
    const docRef = await db.collection('bookings').add(docData);
    const bookingId = docRef.id;

    // ✅ Format phone to international if necessary
    const formattedPhone = phone.startsWith('+') ? phone : `+254${phone.replace(/^0/, '')}`;

    // ✅ Create SMS message content
    const smsMessage = `Alfamaba Booking ✅\n${serviceName} > ${subserviceName}\nFor: ${name} at ${time}, ${date}\nLocation: ${
      location?.address || `${location?.latitude},${location?.longitude}`
    }\nThank you!`;

    // ✅ Send SMS via Twilio
    await twilioClient.messages
      .create({
        body: smsMessage,
        from: fromNumber,
        to: formattedPhone,
      })
      .then(msg => console.log('📤 SMS sent:', msg.sid))
      .catch(err => {
        console.error('❌ Twilio SMS error:', err);
        // Don't fail the request because of SMS issue
      });

    return res.status(200).json({ success: true, id: bookingId });
  } catch (err) {
    console.error('🔥 Booking save error:', err);
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
    console.error('Error fetching bookings:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
