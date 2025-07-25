// routes/serviceOrders.js
import express from 'express';
import { db } from '../firebaseconfig.js'; // Firestore config
import { collection, addDoc, getDocs } from 'firebase/firestore';
import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const router = express.Router();

// ✅ Twilio Setup
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// ✅ POST: Create a new booking and send WhatsApp/SMS
router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      phone,
      serviceName,
      providerName,
      location,
      quantity,
      price,
      status = 'pending',
      notes,
    } = req.body;

    // ✅ Save to Firestore
    const docRef = await addDoc(collection(db, 'ServiceOrders'), {
      customerName,
      phone,
      serviceName,
      providerName,
      location,
      quantity,
      price,
      status,
      notes,
      createdAt: new Date().toISOString(),
    });

    console.log('Booking added with ID:', docRef.id);

    // ✅ Format message
    const messageBody = `🧾 New Booking:
Customer: ${customerName}
Phone: ${phone}
Service: ${serviceName}
Provider: ${providerName || 'Unassigned'}
Location: ${location}
Quantity: ${quantity || 1}
Price: ${price ? `KES ${price}` : 'N/A'}
Status: ${status}
Notes: ${notes || 'None'}`;

    // ✅ Send WhatsApp or SMS (choose your preferred method)
    await client.messages.create({
      body: messageBody,
      from: 'whatsapp:+14155238886', // or use your SMS sender e.g. +1XXXX
      to: `whatsapp:+254${phone.slice(-9)}`, // Kenya format
    });

    res.status(200).json({
      message: 'Service order saved and WhatsApp sent!',
      data: { id: docRef.id, ...req.body },
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Failed to create service order' });
  }
});

// ✅ GET: Retrieve all bookings
router.get('/', async (req, res) => {
  try {
    const snapshot = await getDocs(collection(db, 'ServiceOrders'));
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch service orders' });
  }
});

export default router;
