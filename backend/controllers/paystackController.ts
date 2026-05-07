import crypto from 'crypto';
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Notification from '../models/Notification';
import Transaction from '../models/Transaction';
import User from '../models/User';
import { generateReference, initializeTransaction, verifyTransaction } from '../services/paystackService';

// ─────────────────────────────────────────────────────────────────────────────
// Paystack Controller
//
// Handles Paystack payment integration:
//   - Initialize transaction (server-side, for security)
//   - Verify transaction (client confirmation, not for value delivery)
//   - Webhook handler (charge.success, DVA events)
//
// Per docs: Never trust client-side callbacks for delivering value.
// Always use webhooks. See docs/paystack (accept payments).md
// ─────────────────────────────────────────────────────────────────────────────

// Express augmentation for the raw body buffer stored by server.ts
interface RawBodyRequest extends Request {
  rawBody?: Buffer;
}

/**
 * @desc    Initialize a Paystack transaction for the authenticated user
 * @route   POST /api/paystack/initialize
 * @access  Private
 *
 * Body: { amount }  (in Naira)
 *
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
 * @desc    Verify a transaction status after client reports success
 * @route   GET /api/paystack/verify/:reference
 * @access  Private
 *
 * NOTE: This is for UI confirmation only. The actual wallet credit happens
 * via webhook to prevent issues with network drops or tab closures.
 * See docs: "Always use webhooks for delivering value."
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
 * @desc    Paystack webhook handler
 * @route   POST /api/paystack/webhook
 * @access  Public (no JWT — authenticated via HMAC-SHA512 signature)
 *
 * Handled events:
 *   - charge.success                  → Credit user wallet + create transaction + notification
 *   - dedicatedaccount.assign.success → Save DVA details to user record
 *   - dedicatedaccount.assign.failed  → Log failure for debugging
 *
 * Security: validated via HMAC-SHA512 signature on the raw request body.
 * See: docs/paystack-webhooks.md (Signature validation section)
 *
 * IMPORTANT: Always respond 200 immediately. Long-running work (DB writes)
 * happens after the response to avoid Paystack's timeout and retry storm.
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

    // Verify HMAC-SHA512 signature to confirm event is from Paystack
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

    // ── charge.success — wallet funding via card payment or bank transfer ──
    if (event.event === 'charge.success') {
      const { reference, amount, customer, channel } = event.data;

      // Guard against double-fulfillment: check if this reference was already processed
      // Per docs: "confirm that you haven't already delivered value for that transaction"
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

      // Paystack sends amounts in kobo (lowest denomination); convert back to Naira
      const amountInNaira = amount / 100;
      const oldBalance = user.walletBalance;
      const newBalance = oldBalance + amountInNaira;

      user.walletBalance = newBalance;
      await user.save();

      // Record the transaction (upsert in case a pending record already exists)
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
          description: `Wallet funded via ${channel === 'dedicated_nuban' ? 'bank transfer' : 'Paystack'}`,
          metadata: {
            channel: event.data.channel,
            paystackReference: reference,
          },
        },
        { upsert: true, returnDocument: 'after' },
      );

      // Create in-app notification for the funding
      await Notification.create({
        user: user._id,
        title: 'Wallet Funded',
        message: `₦${amountInNaira.toLocaleString()} has been added to your wallet${channel === 'dedicated_nuban' ? ' via bank transfer' : ''}.`,
      });

      console.log(`[Webhook] Wallet credited: ${customer.email} +₦${amountInNaira} (ref: ${reference})`);
    }

    // ── dedicatedaccount.assign.success — DVA created for customer ──────────
    // Fired when Paystack successfully assigns a dedicated virtual account to a customer.
    // Saves the account details to the user record so the wallet screen can display them.
    if (event.event === 'dedicatedaccount.assign.success') {
      const { customer: eventCustomer, dedicated_account } = event.data;
      await User.findOneAndUpdate(
        { email: eventCustomer.email },
        {
          virtualAccount: {
            accountNumber: dedicated_account.account_number,
            accountName: dedicated_account.account_name,
            bankName: dedicated_account.bank.name,
            customerCode: eventCustomer.customer_code,
          },
        },
      );
      console.log(`[Webhook] DVA assigned: ${eventCustomer.email} → ${dedicated_account.account_number}`);
    }

    // ── dedicatedaccount.assign.failed — DVA creation failed ────────────────
    if (event.event === 'dedicatedaccount.assign.failed') {
      const { customer: failedCustomer } = event.data;
      console.error(`[Webhook] DVA assignment failed for ${failedCustomer?.email || 'unknown'}`);
    }
  } catch (error: any) {
    console.error('[Webhook] Processing error:', error.message);
  }
};
