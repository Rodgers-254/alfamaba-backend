// api/getBookings.js
import 'dotenv/config';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore }        from 'firebase-admin/firestore';

// Initialize Firebase Admin once
if (!global.firebaseAdminInit) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_JSON);
  initializeApp({ credential: cert(serviceAccount) });
  global.firebaseAdminInit = true;
}
const db = getFirestore();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const snapshot = await db
      .collection('bookings')
      .orderBy('createdAt', 'desc')
      .get();
    const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json(bookings);
  } catch (err) {
    console.error('Failed to fetch bookings:', err);
    return res.status(500).json({ error: 'Failed to fetch bookings' });
  }
}
