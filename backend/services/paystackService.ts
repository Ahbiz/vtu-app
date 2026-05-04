import axios from "axios";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = "http://10.70.117.249:5000/api";

const paystackAxios = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET}`,
    "Content-Type": "application/json",
  },
});

// Initialize a transaction — returns authorization_url and reference
export const initializeTransaction = async (
  email: string,
  amount: number,
  metadata?: object,
) => {
  const response = await paystackAxios.post("/transaction/initialize", {
    email,
    amount: amount * 100, // Convert to kobo (smallest unit)
    metadata,
  });
  return response.data.data; // { authorization_url, access_code, reference }
};

// Verify a transaction by reference
export const verifyTransaction = async (reference: string) => {
  const response = await paystackAxios.get(`/transaction/verify/${reference}`);
  return response.data.data; // Full transaction object
};
