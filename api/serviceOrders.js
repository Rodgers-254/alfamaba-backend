// backend/routes/serviceOrders.js
import express from 'express';
// from backend/routes → up two levels to project root
import { db } from '../../firebaseconfig.js';
import { collection, addDoc, getDocs } from 'firebase/firestore';

const router = express.Router();

// POST: Create a new service order
router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      phone,
      serviceName,
      providerName,
      status = 'pending',
      date,
      location,          // <-- now pulled from the client payload
    } = req.body;

    if (!customerName || !phone || !serviceName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // include location if provided (could be { address } or { latitude, longitude })
    const newOrder = {
      customerName,
      phone,
      serviceName,
      provider: providerName || '',
      status,
      date: date || new Date().toISOString(),
      location: location || null,
      createdAt: new Date().toISOString(),
    };

    const addedRef = await addDoc(
      collection(db, 'serviceOrders'),
      newOrder
    );

    return res.status(200).json({ id: addedRef.id, ...newOrder });
  } catch (error) {
    console.error('🔥 POST error in serviceOrders:', error);
    return res.status(500).json({ message: 'Server error during POST' });
  }
});

// GET: Fetch all service orders
router.get('/', async (_req, res) => {
  try {
    const snapshot = await getDocs(collection(db, 'serviceOrders'));
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json(orders);
  } catch (error) {
    console.error('🔥 GET error in serviceOrders:', error);
    return res.status(500).json({ message: 'Server error during GET' });
  }
});

export default router;
