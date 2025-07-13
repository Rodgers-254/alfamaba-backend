// api/serviceOrders.js
import { db } from '../firebaseconfig.js';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const {
        customerName,
        phone,
        serviceName,
        providerName,
        status = "pending",
        date,
      } = req.body;

      if (!customerName || !phone || !serviceName) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const newOrder = {
        customerName,
        phone,
        serviceName,
        provider: providerName || '',
        status,
        date: date || new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      const addedRef = await addDoc(collection(db, 'serviceOrders'), newOrder);
      return res.status(200).json({ id: addedRef.id, ...newOrder });

    } catch (error) {
      console.error('🔥 POST error in serviceOrders:', error);
      return res.status(500).json({ message: 'Server error during POST' });
    }

  } else if (req.method === 'GET') {
    try {
      const snapshot = await getDocs(collection(db, 'serviceOrders'));
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.status(200).json(orders);
    } catch (error) {
      console.error('🔥 GET error in serviceOrders:', error);
      return res.status(500).json({ message: 'Server error during GET' });
    }

  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
