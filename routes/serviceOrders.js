// routes/serviceOrders.js
import express from 'express';
import { db } from '../firebaseconfig.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      phone,
      serviceName,
      providerName = '',
      date = '',
      time = '',
      location = '',
      category = '',
      status = 'pending',
      quantity = 1,
      price = 0,
    } = req.body;

    if (!customerName || !phone || !serviceName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const docData = {
      customerName,
      phone,
      serviceName,
      providerName,
      date,
      time,
      location,
      category,
      status,
      quantity,
      price,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('serviceOrders').add(docData);
    return res.status(200).json({ success: true, id: docRef.id });
  } catch (err) {
    console.error('Error saving service order:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
