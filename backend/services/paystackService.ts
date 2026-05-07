import axios from 'axios';
import crypto from 'crypto';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET_KEY) {
  // Fail loudly at startup rather than silently at runtime
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
 * Using a server-side reference (rather than letting Paystack auto-generate one) is required
 * for idempotency checks — see: https://paystack.com/docs/payments/verify-payments/
 */
export const generateReference = (): string => {
  return `TXN-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
};

/**
 * Initializes a Paystack transaction and returns the access_code and reference.
 * Amount must be in Naira; this function converts to kobo before sending.
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
      amount: amount * 100, // Paystack requires kobo (1 NGN = 100 kobo)
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
 * Creates a Paystack customer record.
 * Required before assigning a Dedicated Virtual Account.
 * https://paystack.com/docs/api/customer/#create
 */
export const createPaystackCustomer = async (
  email: string,
  firstName: string,
  lastName: string,
  phone: string,
): Promise<{ customer_code: string; id: number }> => {
  try {
    const response = await paystackAxios.post('/customer', {
      email,
      first_name: firstName,
      last_name: lastName,
      phone,
    });
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    throw new Error(`Paystack create customer failed: ${message}`);
  }
};

/**
 * Assigns a Dedicated Virtual Account to an existing Paystack customer.
 * Uses 'test-bank' in test mode; switch to a real provider slug in production.
 * https://paystack.com/docs/payments/dedicated-virtual-accounts/
 */
export const assignDedicatedVirtualAccount = async (
  customerCode: string,
): Promise<{ account_number: string; account_name: string; bank: { name: string } }> => {
  try {
    const response = await paystackAxios.post('/dedicated_account', {
      customer: customerCode,
      preferred_bank: 'test-bank', // use 'wema-bank' or 'titan-paystack' in production
    });
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    throw new Error(`Paystack assign DVA failed: ${message}`);
  }
};
