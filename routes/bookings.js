// routes/bookings.js
import express from 'express';
import { db } from '../firebaseAdmin.js'; // Admin SDK
import admin from 'firebase-admin';

const router = express.Router();

// 🔥 POST /api/bookings
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

    // ✅ Step 1: Get the service document
    const serviceRef = db.collection('services').doc(serviceId);
    const serviceSnap = await serviceRef.get();

    if (!serviceSnap.exists) {
      return res.status(404).json({ error: 'Service not found in Firestore' });
    }

    const serviceData = serviceSnap.data();

    // ✅ Step 2: Get the subservice price
    const matchedSub = serviceData.subservices?.find(
      s => s.name.toLowerCase() === subserviceName.toLowerCase()
    );

    const price = matchedSub?.price || 0;

    // ✅ Step 3: Save booking
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
      location: location || null,
      price, // ✅ Price now correctly set
      createdAt: createdAt || new Date().toISOString(),
      status: 'PendingPayment',
    };

    const docRef = await db.collection('bookings').add(docData);

    return res.status(200).json({ success: true, id: docRef.id });
  } catch (err) {
    console.error('❌ Error creating booking:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
