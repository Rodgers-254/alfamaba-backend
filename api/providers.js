// api/providers.js
import { getFirestore }       from "firebase-admin/firestore";
import { initFirebaseAdmin }  from "./utils/firebase";

initFirebaseAdmin();
const db = getFirestore();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Only GET allowed" });
  }
  try {
    const snapshot = await db
      .collection("users")
      .where("role", "==", "provider")
      .get();
    const providers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.status(200).json(providers);
  } catch (err) {
    console.error("Providers fetch error:", err);
    res.status(500).json({ error: "Failed to fetch providers" });
  }
}
