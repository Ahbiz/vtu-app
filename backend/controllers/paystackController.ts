import crypto from 'crypto';
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Transaction from '../models/Transaction';
import User from '../models/User';
import { generateReference, initializeTransaction, verifyTransaction } from '../services/paystackService';

// Express augmentation for the raw body buffer stored by server.ts
interface RawBodyRequest extends Request {
  rawBody?: Buffer;
}

/**
 * POST /api/paystack/initialize
 * Starts a Paystack transaction for the authenticated user.
 * Email is sourced from the verified JWT — not from the request body — to prevent spoofing.
 */
export const initialize = async (req: AuthRequest, res: Response) => {
  try {
    const { amount } = req.body;
    const email = req.user?.email;

    if (!email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: 'A positive numeric amount is required' });
    }

    const reference = generateReference();
    const data = await initializeTransaction(email, amount, reference);

    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/paystack/verify/:reference
 * Verifies a transaction after the client reports success.
 * The actual wallet credit happens via webhook; this endpoint is for UI confirmation only.
 */
export const verify = async (req: AuthRequest & { params: { reference: string } }, res: Response) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({ message: 'Transaction reference is required' });
    }

    const data = await verifyTransaction(reference);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/paystack/webhook
 * Receives charge.success events from Paystack and credits the user's wallet.
 *
 * Security: validated via HMAC-SHA512 signature on the raw request body.
 * See: https://paystack.com/docs/payments/webhooks/#verify-event-origin
 *
 * IMPORTANT: Always respond 200 immediately. Long-running work (DB writes) should
 * happen after the response to avoid Paystack's 30-second timeout and retry storm.
 */
export const webhook = async (req: RawBodyRequest, res: Response) => {
  // Respond 200 immediately — Paystack retries if it doesn't get a fast acknowledgement
  res.sendStatus(200);

  try {
    const signature = req.headers['x-paystack-signature'] as string;

    if (!req.rawBody) {
      console.error('[Webhook] rawBody is missing — check server.ts verify callback');
      return;
    }

    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY as string)
      .update(req.rawBody)
      .digest('hex');

    if (hash !== signature) {
      // Signature mismatch — likely a spoofed request; silently discard
      console.warn('[Webhook] Invalid signature — request discarded');
      return;
    }

    const event = req.body;

    if (event.event === 'charge.success') {
      const { reference, amount, customer } = event.data;

      // Guard against double-fulfillment: check if this reference was already processed
      const existing = await Transaction.findOne({ reference });
      if (existing && existing.status === 'success') {
        console.log(`[Webhook] Duplicate event for reference ${reference} — skipped`);
        return;
      }

      const user = await User.findOne({ email: customer.email });
      if (!user) {
        console.error(`[Webhook] No user found for email ${customer.email}`);
        return;
      }

      // Paystack sends amounts in kobo; convert back to Naira for storage
      const amountInNaira = amount / 100;
      const oldBalance = user.walletBalance;
      const newBalance = oldBalance + amountInNaira;

      user.walletBalance = newBalance;
      await user.save();

      await Transaction.findOneAndUpdate(
        { reference },
        {
          user: user._id,
          reference,
          amount: amountInNaira,
          type: 'funding',
          status: 'success',
          oldBalance,
          newBalance,
          description: `Wallet funded via Paystack`,
        },
        { upsert: true, new: true },
      );

      console.log(`[Webhook] Wallet credited: ${customer.email} +₦${amountInNaira} (ref: ${reference})`);
    }
  } catch (error: any) {
    console.error('[Webhook] Processing error:', error.message);
  }
};
