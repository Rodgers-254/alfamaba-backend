// api/serviceOrders.js
import express from 'express';
import { db } from '../firebaseconfig.js';
import { collection, addDoc } from 'firebase/firestore';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      phone,
      serviceName,
      providerName,
      date,
      time,
      location,
      category,
      status = 'pending',
      coordinates,
      quantity
    } = req.body;

    if (!customerName || !phone || !serviceName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newBooking = {
      customerName,
      phone,
      serviceName,
      providerName: providerName || '',
      date: date || '',
      time: time || '',
      location: location || '',
      category: category || '',
      status,
      coordinates: coordinates || null,
      quantity: quantity || 1,
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'bookings'), newBooking);
    return res.status(200).json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Error saving booking:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
