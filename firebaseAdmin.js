// firebaseAdmin.js (at project root)
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!process.env.FIREBASE_ADMIN_JSON) {
  console.error('❌ Missing FIREBASE_ADMIN_JSON env‑var');
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_JSON);
} catch (err) {
  console.error('❌ Failed to parse FIREBASE_ADMIN_JSON:', err);
  process.exit(1);
}

const admin = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

export { admin, db };
