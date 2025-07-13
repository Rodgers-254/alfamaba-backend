import { getFirestore } from "firebase-admin/firestore";
import { initFirebaseAdmin } from "../utils/firebase";
import 'dotenv/config'; // for ESModules


initFirebaseAdmin();
const db = getFirestore();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const snapshot = await db.collection("bookings").orderBy("createdAt", "desc").get();
      const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.status(200).json(bookings);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
