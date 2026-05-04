import axios from 'axios';

/**
 * [WHAT] - This is the Paystack Service.
 * [WHY] - It handles all the direct communication between our server and Paystack's API.
 * [HOW] - It uses the Axios library to make HTTP requests (GET and POST) to Paystack's secure endpoints.
 */

// We pull our Secret Key from the .env file.
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// [WHAT] - We check if the key is missing right away.
// [WHY] - Without this key, Paystack will reject every single request.
if (!PAYSTACK_SECRET_KEY) {
  console.error('CRITICAL ERROR: PAYSTACK_SECRET_KEY is missing in .env');
}

// The base URL for all Paystack API calls.
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

/**
 * Configuration for Axios. 
 * We set the Authorization header here so we don't have to repeat it for every call.
 */
const paystackAxios = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

/**
 * [WHAT] - Initialize Transaction function.
 * [WHY] - To start a payment process, we must first tell Paystack who is paying and how much.
 * [HOW] - We send a POST request with the user's email and the amount.
 */
export const initializeTransaction = async (email: string, amount: number) => {
  try {
    // Paystack expects amounts in kobo (the smallest Nigerian currency unit).
    // [TERM] - Kobo: 1/100th of a Naira. ₦1 = 100 Kobo.
    // So we multiply the Naira amount by 100: ₦500 becomes 50000 kobo.
    const amountInKobo = amount * 100;

    const response = await paystackAxios.post('/transaction/initialize', {
      email,
      amount: amountInKobo,
    });

    // We return the data from Paystack, which includes the 'authorization_url' 
    // the user will use to pay, and a unique 'reference' for the transaction.
    return response.data.data;
  } catch (error: any) {
    // We log the specific message from Paystack so you can see exactly why it failed.
    const errorMessage = error.response?.data?.message || error.message;
    console.error('Paystack Initialize Error:', errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * [WHAT] - Verify Transaction function.
 * [WHY] - After a user pays, we must double-check with Paystack to ensure the money was actually received.
 * [HOW] - We send a GET request using the unique transaction 'reference'.
 */
export const verifyTransaction = async (reference: string) => {
  try {
    const response = await paystackAxios.get(`/transaction/verify/${reference}`);

    // We return the transaction status and details.
    return response.data.data;
  } catch (error: any) {
    console.error('Paystack Verify Error:', error.response?.data || error.message);
    throw new Error('Could not verify Paystack transaction');
  }
};
