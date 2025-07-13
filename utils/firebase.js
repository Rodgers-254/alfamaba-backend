// utils/firebase.js
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore }        from 'firebase-admin/firestore';

export function initFirebaseAdmin() {
  // In production we load the JSON from an env var
  let serviceAccount;
  if (process.env.FIREBASE_ADMIN_JSON) {
    serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_JSON);
  } else {
    // Local dev: read the JSON file you kept un‑tracked
    serviceAccount = JSON.parse(
      require('fs').readFileSync(
        require('path').resolve(process.cwd(), 'api/firebase-adminsdk.json'),
        'utf8'
      )
    );
  }

  initializeApp({ credential: cert(serviceAccount) });
  return getFirestore();
}
