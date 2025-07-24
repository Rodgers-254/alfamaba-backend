// routes/serviceOrders.js
import express from 'express';

const router = express.Router();

// Mock POST route (you can replace with DB logic)
router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      phone,
      serviceName,
      providerName,
      location,
      status = 'pending', // default value
    } = req.body;

    // This is where you'd save to Firestore or another DB
    console.log('New service order:', req.body);

    res.status(200).json({ message: 'Service order received!', data: req.body });
  } catch (error) {
    console.error('Error creating service order:', error);
    res.status(500).json({ error: 'Failed to create service order' });
  }
});

// Optionally add GET, PUT, DELETE routes below

export default router;
