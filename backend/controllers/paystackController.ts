import { Request, Response } from 'express';
import crypto from 'crypto';
import { verifyTransaction, initializeTransaction } from '../services/paystackService';

/**
 * [WHAT] - This is the Paystack Controller.
 * [WHY] - It connects our API URLs (routes) to the logic in our Paystack Service.
 * [HOW] - It receives requests from the frontend, calls the service, and sends back a response.
 */

/**
 * [WHAT] - Handles initializing a payment.
 */
export const initialize = async (req: Request, res: Response) => {
  try {
    const { email, amount } = req.body;

    if (!email || !amount) {
      return res.status(400).json({ message: 'Email and amount are required' });
    }

    const data = await initializeTransaction(email, amount);
    
    // We send back the authorization URL and reference to the mobile app.
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * [WHAT] - Handles verifying a payment.
 */
export const verify = async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({ message: 'Transaction reference is required' });
    }

const data = await verifyTransaction(reference as string);
    // We send back the full transaction details (success, failed, etc.)
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * [WHAT] - Handles Paystack Webhooks.
 * [WHY] - Paystack sends a message to this function automatically whenever a payment is successful.
 * [HOW] - We verify that the message is really from Paystack and then update our records.
 */
export const webhook = async (req: Request, res: Response) => {
  try {
    // 1. We grab the 'signature' Paystack sent in the header.
    // [TERM] - Signature: A digital fingerprint used to verify that a message hasn't been tampered with.
    const signature = req.headers['x-paystack-signature'] as string;

    // 2. We create our own fingerprint of the message using our Secret Key.
    // [IMPORTANT] - We use 'req.rawBody' instead of 'JSON.stringify(req.body)'.
    // [WHY] - re-stringifying can change the text (like adding spaces), which breaks the signature.
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY as string)
      .update((req as any).rawBody)
      .digest('hex');

    // 3. We compare the fingerprints. If they match, the message is authentic!
    if (hash !== signature) {
      // If they don't match, someone might be trying to trick our server.
      return res.status(401).send('Invalid signature');
    }

    // 4. If authentic, we get the event data.
    const event = req.body;

    // We only care if the payment was successful.
    if (event.event === 'charge.success') {
      const { reference, amount, customer } = event.data;

      // This is where you would normally update the user's wallet balance.
      // We log it here as a placeholder for the actual wallet logic.
      console.log(`[PAYSTACK WEBHOOK] Payment Successful! Ref: ${reference}, User: ${customer.email}, Amount: ${amount}`);
    }

    // 5. We MUST send a 200 OK response to Paystack within a few seconds,
    // otherwise Paystack will think we didn't get the message and keep retrying.
    res.sendStatus(200);
  } catch (error: any) {
    console.error('Webhook Error:', error.message);
    res.sendStatus(500);
  }
};
