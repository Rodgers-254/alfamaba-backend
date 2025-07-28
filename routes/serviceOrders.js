// routes/serviceOrders.js
import express from 'express';
import { db } from '../firebaseAdmin.js'; // ✅ Firebase Admin SDK
import twilio from 'twilio';

const router = express.Router();

// ✅ Twilio config from environment variables
const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_TOKEN
);
const twilioFrom = process.env.TWILIO_FROM;
const adminNumber = process.env.TWILIO_ADMIN;

router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      phone,
      serviceName,
      providerName = '',
      date = '',
      time = '',
      location = '',
      category = '',
      status = 'pending',
      quantity = 1,
      price = 0,
    } = req.body;

    if (!customerName || !phone || !serviceName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const docData = {
      customerName,
      phone,
      serviceName,
      providerName,
      date,
      time,
      location,
      category,
      status,
      quantity,
      price,
      createdAt: new Date().toISOString(),
    };

    // ✅ Save booking
    const docRef = await db.collection('serviceOrders').add(docData);

    // ✅ Send WhatsApp message via Twilio
    const messageBody = `📦 *New Booking Received!*
    
👤 Name: ${customerName}
📞 Phone: ${phone}
💈 Service: ${serviceName}
📅 Date: ${date || 'N/A'}
⏰ Time: ${time || 'N/A'}
📍 Location: ${location || 'N/A'}
🧮 Quantity: ${quantity}
💵 Price: KES ${price}
🔖 Category: ${category || 'N/A'}
🧑‍💼 Provider: ${providerName || 'Not assigned'}

Visit admin panel for more details.`;

    await client.messages.create({
      body: messageBody,
      from: `whatsapp:${twilioFrom}`,
      to: `whatsapp:${adminNumber}`,
    });

    return res.status(200).json({ success: true, id: docRef.id });
  } catch (err) {
    console.error('Error saving service order or sending Twilio message:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
