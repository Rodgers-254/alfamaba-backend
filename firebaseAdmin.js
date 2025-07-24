// alfamaba-backend/firebaseadmin.js
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import admin from 'firebase-admin';

const app = initializeApp({
  credential: applicationDefault(),
  storageBucket: 'alfamaba-ed838.appspot.com',
});

const db = getFirestore(app);
const auth = getAuth(app);
const bucket = getStorage(app);

export { admin, db, auth, bucket };
