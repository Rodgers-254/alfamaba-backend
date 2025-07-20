// api/postBooking.js
import 'dotenv/config';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore }        from 'firebase-admin/firestore';
import twilio                  from 'twilio';

if (!global.firebaseAdminInit) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_JSON);
  initializeApp({ credential: cert(serviceAccount) });
  global.firebaseAdminInit = true;
}
const db = getFirestore();
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const payload = req.body;
    const timestamp = new Date().toISOString();

    // Determine booking type
    let docData, messageBody;
    if (payload.packageId) {
      // Package booking
      const { packageId, items, customer } = payload;
      docData = {
        packageId,
        items,
        customer,
        createdAt: timestamp,
      };

      // Build items description
      const itemsDesc = items.map(it => `${it.quantity}× (${it.serviceId})`).join(', ');
      messageBody =
        `📦 New package booking (${packageId}):\n` +
        `👤 ${customer.name} • ${customer.phone}\n` +
        `🛍 Items: ${itemsDesc}\n` +
        `📅 ${customer.date} @ ${customer.time}\n` +
        `📍 ${customer.address ?? `${customer.latitude},${customer.longitude}`}`;
    } else {
      // Subservice booking
      const { name, phone, date, time, serviceName, subserviceName, category, location } = payload;
      const loc = location.address
        ? { address: location.address }
        : { latitude: location.latitude, longitude: location.longitude };

      docData = {
        name,
        phone,
        date,
        time,
        serviceName,
        subserviceName,
        category,
        location: loc,
        createdAt: timestamp,
      };

      messageBody =
        `📦 New booking: ${docData.name}\n` +
        `👤 ${name} • ${phone}\n` +
        `💇 ${serviceName} > ${subserviceName}\n` +
        `📂 Category: ${category}\n` +
        `🗓 ${date} @ ${time}\n` +
        `📍 ${loc.address ?? `${loc.latitude},${loc.longitude}`}`;
    }

    // Save to Firestore
    const docRef = await db.collection('bookings').add(docData);

    // Send Twilio notification
    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_FROM}`,
      to:   `whatsapp:${process.env.TWILIO_ADMIN}`,
      body: messageBody,
    });

    return res.status(200).json({ success: true, id: docRef.id });

  } catch (err) {
    console.error('Error processing booking:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
