import axios from 'axios';
import crypto from 'crypto';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET_KEY) {
  throw new Error('CRITICAL: PAYSTACK_SECRET_KEY is missing from environment variables');
}

const paystackAxios = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

/**
 * Generates a unique transaction reference.
 * Server-side reference required for idempotency — prevents double-fulfillment.
 * https://paystack.com/docs/payments/verify-payments/
 */
export const generateReference = (): string => {
  return `TXN-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
};

/**
 * Initializes a Paystack transaction.
 * Amount in Naira — converted to kobo (×100) before sending to Paystack.
 * https://paystack.com/docs/api/transaction/#initialize
 */
export const initializeTransaction = async (
  email: string,
  amount: number,
  reference: string,
): Promise<{ access_code: string; authorization_url: string; reference: string }> => {
  try {
    const response = await paystackAxios.post('/transaction/initialize', {
      email,
      amount: amount * 100,
      reference,
    });
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    throw new Error(`Paystack initialize failed: ${message}`);
  }
};

/**
 * Verifies a transaction by reference.
 * Always verify server-side — never trust client-reported success.
 * https://paystack.com/docs/payments/verify-payments/
 */
export const verifyTransaction = async (reference: string) => {
  try {
    const response = await paystackAxios.get(`/transaction/verify/${reference}`);
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    throw new Error(`Paystack verify failed: ${message}`);
  }
};

/**
 * Single-step DVA assignment per the Paystack docs.
 * Creates a Paystack customer and assigns a dedicated virtual account in one call.
 * Uses 'test-bank' in test mode — switch to 'wema-bank' or 'titan-paystack' in production.
 *
 * The result is asynchronous: Paystack fires dedicatedaccount.assign.success or
 * dedicatedaccount.assign.failed webhooks when the account is ready.
 *
 * https://paystack.com/docs/payments/dedicated-virtual-accounts/#single-step-account-assignment
 */
export const assignDedicatedVirtualAccountSingleStep = async (params: {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}): Promise<void> => {
  try {
    await paystackAxios.post('/dedicated_account/assign', {
      email: params.email,
      first_name: params.firstName,
      last_name: params.lastName,
      phone: params.phone,
      preferred_bank: 'test-bank',
      country: 'NG',
    });
    // 202 Accepted — Paystack processes asynchronously and fires webhook on completion
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    throw new Error(`Paystack DVA assign failed: ${message}`);
  }
};
