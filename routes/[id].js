// api/bookings/[id].js
import { getFirestore }      from "firebase-admin/firestore";
import { initFirebaseAdmin } from "../utils/firebase";

initFirebaseAdmin();
const db = getFirestore();

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "PATCH") {
    // Collect only the fields we want to allow
    const updates = {};
    if (req.body.read !== undefined)        updates.read = req.body.read;
    if (req.body.providerId)                updates.providerId = req.body.providerId;
    if (req.body.status)                    updates.status = req.body.status;

    try {
      await db.collection("bookings").doc(id).update(updates);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("Booking update error:", err);
      return res.status(500).json({ error: "Failed to update booking" });
    }
  }

  // Everything else is not allowed
  res.setHeader("Allow", "PATCH");
  res.status(405).json({ error: "Method Not Allowed" });
}
