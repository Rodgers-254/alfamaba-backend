// firebaseAdmin.js
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let db;

try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_JSON);

  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
    });
  }

  db = getFirestore();
} catch (err) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', err.message);
  process.exit(1); // Stop the server if Firebase fails
}

export { db };
