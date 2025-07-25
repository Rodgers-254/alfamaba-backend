// routes/bookings.js
import express from 'express';
import { db } from '../firebaseconfig.js';  // your admin init file

const router = express.Router();

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
      createdAt
    } = req.body;

    // Simple validation
    if (!name || !phone || !serviceName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Build your Firestore document
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
    return res.status(200).json({ success: true, id: docRef.id });
  } catch (err) {
    console.error('Error saving booking:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// (Optional) GET /api/bookings — list bookings
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
