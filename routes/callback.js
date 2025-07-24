// alfamaba-backend/api/callback.js
import express from 'express';
import { db } from '../firebaseAdmin.js';

const router = express.Router();

router.post('/callback', async (req, res) => {
  const cb = req.body.Body.stkCallback;
  const checkoutId = cb.CheckoutRequestID;

  if (cb.ResultCode === 0) {
    // success
    const meta = cb.CallbackMetadata.Item.reduce((acc, i) => {
      acc[i.Name] = i.Value;
      return acc;
    }, {});
    await db.collection('bookings').doc(checkoutId).update({
      status: 'PaymentReceived',
      mpesaReceipt: meta.MpesaReceiptNumber,
      paidAt: new Date().toISOString(),
    });
  } else {
    // failed
    await db.collection('bookings').doc(checkoutId).update({
      status: 'PaymentFailed',
      failureReason: cb.ResultDesc,
    });
  }

  // Acknowledge Safaricom
  res.json({ ResultCode: 0, ResultDesc: 'Received' });
});

export default router;
