// firebaseAdmin.js (at the root of alfamaba-backend)
import admin from 'firebase-admin';
import path from 'path';

// Construct an absolute path to your JSON file in the api folder:
const serviceAccountPath = path.join(__dirname, 'api', 'firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
});

export const db = admin.firestore();
