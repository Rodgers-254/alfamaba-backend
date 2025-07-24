// alfamaba-backend/api/stkpush.js
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { db } from '../firebaseAdmin.js';

dotenv.config();
const router = express.Router();

const getTimestamp = () =>
  new Date().toISOString().replace(/[-T:\.Z]/g, '').slice(0, 14);

const generatePassword = (shortcode, passkey, timestamp) =>
  Buffer.from(shortcode + passkey + timestamp).toString('base64');

async function getAccessToken() {
  const { data } = await axios.get(
    (process.env.MPESA_ENV === 'sandbox'
      ? 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
      : 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'),
    {
      auth: {
        username: process.env.CONSUMER_KEY,
        password: process.env.CONSUMER_SECRET,
      },
    }
  );
  return data.access_token;
}

router.post('/stkpush', async (req, res) => {
  const { phone, amount, checkoutId } = req.body;
  const timestamp = getTimestamp();
  const password = generatePassword(
    process.env.BUSINESS_SHORTCODE,
    process.env.MPESA_PASSKEY,
    timestamp
  );
  let token;
  try {
    token = await getAccessToken();
  } catch (e) {
    return res.status(500).json({ error: 'Auth failed' });
  }

  try {
    const { data } = await axios.post(
      (process.env.MPESA_ENV === 'sandbox'
        ? 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
        : 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'),
      {
        BusinessShortCode: process.env.BUSINESS_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phone,
        PartyB: process.env.BUSINESS_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: `${process.env.HOST}/api/mpesa/callback`,
        AccountReference: checkoutId,
        TransactionDesc: 'Service payment',
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // mark booking pending
    await db.collection('bookings').doc(checkoutId).update({
      status: 'PendingPayment',
    });

    res.json(data);
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json({ error: 'STK Push failed' });
  }
});

export default router;
