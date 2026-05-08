import axios, { AxiosInstance } from 'axios';

// ─────────────────────────────────────────────────────────────────────────────
// QuickVTU Service — External VTU API Integration
// Docs: docs/quickvtu.md
//
// Authentication: Basic Auth (base64-encoded username:password) → AccessToken.
// All subsequent requests use `Authorization: Token <AccessToken>`.
//
// Endpoints used:
//   POST /api/user    — authenticate & get token
//   POST /api/topup/  — buy airtime
//   POST /api/data    — buy data
//   POST /api/cable   — buy cable TV subscription
//   POST /api/bill    — pay electricity bill
//   GET  /api/cable/cable-validation — verify IUC number
//   GET  /api/bill/bill-validation   — verify meter number
// ─────────────────────────────────────────────────────────────────────────────

const QUICKVTU_BASE_URL = 'https://quickvtu.com/api';
const QUICKVTU_USERNAME = process.env.QUICKVTU_USERNAME as string;
const QUICKVTU_PASSWORD = process.env.QUICKVTU_PASSWORD as string;

// In-memory token cache — refreshed every 23 hours to stay ahead of expiry
let accessToken = process.env.QUICKVTU_ACCESS_TOKEN || '';
let tokenExpiresAt = 0; // Unix timestamp in ms

/**
 * Returns a valid QuickVTU access token, refreshing it if expired.
 * Caches the token in memory for 23 hours to avoid unnecessary auth calls.
 */
const getQuickVTUToken = async (): Promise<string> => {
  const now = Date.now();
  if (accessToken && now < tokenExpiresAt) {
    return accessToken;
  }

  const credentials = Buffer.from(`${QUICKVTU_USERNAME}:${QUICKVTU_PASSWORD}`).toString('base64');
  const response = await axios.post(
    `${QUICKVTU_BASE_URL}/user`,
    {},
    { headers: { Authorization: `Basic ${credentials}` } },
  );

  if (response.data.status !== 'success') {
    throw new Error(`QuickVTU auth failed: ${response.data.message || 'Unknown error'}`);
  }

  accessToken = response.data.AccessToken;
  tokenExpiresAt = now + 23 * 60 * 60 * 1000; // 23 hours
  return accessToken;
};

/**
 * Creates an axios instance with a fresh QuickVTU access token.
 */
const getClient = async (): Promise<AxiosInstance> => {
  const token = await getQuickVTUToken();
  return axios.create({
    baseURL: QUICKVTU_BASE_URL,
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

// ─── Authentication ──────────────────────────────────────────────────────────

/**
 * Authenticates with QuickVTU using Basic Auth and stores the returned token.
 * Per docs: POST /api/user with Authorization: Basic base64(username:password)
 *
 * @returns The access token string and current QuickVTU wallet balance.
 */
export const authenticateQuickVTU = async (): Promise<{ token: string; balance: string }> => {
  try {
    const credentials = Buffer.from(`${QUICKVTU_USERNAME}:${QUICKVTU_PASSWORD}`).toString('base64');

    const response = await axios.post(
      `${QUICKVTU_BASE_URL}/user`,
      {},
      {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      },
    );

    if (response.data.status !== 'success') {
      throw new Error(`QuickVTU auth failed: ${response.data.message || 'Unknown error'}`);
    }

    // Cache the token for subsequent API calls
    accessToken = response.data.AccessToken;

    return {
      token: response.data.AccessToken,
      balance: response.data.balance,
    };
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    throw new Error(`QuickVTU authentication failed: ${message}`);
  }
};

// ─── Airtime ─────────────────────────────────────────────────────────────────

/**
 * Purchases airtime via QuickVTU.
 * Per docs: POST /api/topup/
 *
 * @param network   Network ID (1=MTN, 2=AIRTEL, 3=GLO, 4=9MOBILE)
 * @param phone     Destination phone number
 * @param amount    Amount in Naira
 * @param requestId Unique request ID for idempotency
 */
export const buyAirtime = async (params: {
  network: number;
  phone: string;
  amount: number;
  requestId: string;
}): Promise<any> => {
  try {
    const client = await getClient();
    const response = await client.post('/topup/', {
      network: params.network,
      phone: params.phone,
      plan_type: 'VTU',
      amount: params.amount,
      bypass: false,
      'request-id': params.requestId,
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    throw new Error(`QuickVTU airtime purchase failed: ${message}`);
  }
};

// ─── Data ────────────────────────────────────────────────────────────────────

/**
 * Purchases a data plan via QuickVTU.
 * Per docs: POST /api/data
 *
 * @param network   Network ID (1=MTN, 2=AIRTEL, 3=GLO, 4=9MOBILE)
 * @param phone     Destination phone number
 * @param dataPlan  Data plan ID from QuickVTU plan table
 * @param requestId Unique request ID for idempotency
 */
export const buyData = async (params: {
  network: number;
  phone: string;
  dataPlan: number;
  requestId: string;
}): Promise<any> => {
  try {
    const client = await getClient();
    const response = await client.post('/data', {
      network: params.network,
      phone: params.phone,
      data_plan: params.dataPlan,
      bypass: false,
      'request-id': params.requestId,
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    throw new Error(`QuickVTU data purchase failed: ${message}`);
  }
};

// ─── Cable TV ────────────────────────────────────────────────────────────────

/**
 * Purchases a cable TV subscription via QuickVTU.
 * Per docs: POST /api/cable
 *
 * @param cable     Cable provider ID (1=GOTV, 2=DSTV, 3=STARTIME)
 * @param iuc       IUC / SmartCard number
 * @param cablePlan Cable plan ID from QuickVTU plan table
 * @param requestId Unique request ID for idempotency
 */
export const buyCable = async (params: {
  cable: number;
  iuc: string;
  cablePlan: number;
  requestId: string;
}): Promise<any> => {
  try {
    const client = await getClient();
    const response = await client.post('/cable', {
      cable: params.cable,
      iuc: params.iuc,
      cable_plan: params.cablePlan,
      bypass: false,
      'request-id': params.requestId,
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    throw new Error(`QuickVTU cable purchase failed: ${message}`);
  }
};

/**
 * Verifies an IUC / SmartCard number before cable purchase.
 * Per docs: GET /api/cable/cable-validation?iuc=...&cable=...
 *
 * @param iuc   SmartCard / IUC number
 * @param cable Cable provider ID (1=GOTV, 2=DSTV, 3=STARTIME)
 */
export const verifyIUC = async (iuc: string, cable: number): Promise<any> => {
  try {
    const client = await getClient();
    const response = await client.get('/cable/cable-validation', {
      params: { iuc, cable },
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    throw new Error(`QuickVTU IUC verification failed: ${message}`);
  }
};

// ─── Electricity ─────────────────────────────────────────────────────────────

/**
 * Pays an electricity bill via QuickVTU.
 * Per docs: POST /api/bill
 *
 * @param disco       Disco ID (1=Ikeja, 2=Eko, 3=Kano, 4=PH, 5=Jos, 6=Ibadan, 7=Kaduna, 8=Abuja, 9=Benin, 10=Enugu)
 * @param meterType   'prepaid' or 'postpaid'
 * @param meterNumber Customer's meter number
 * @param amount      Amount in Naira
 * @param requestId   Unique request ID for idempotency
 */
export const payElectricity = async (params: {
  disco: number;
  meterType: string;
  meterNumber: string;
  amount: number;
  requestId: string;
}): Promise<any> => {
  try {
    const client = await getClient();
    const response = await client.post('/bill', {
      disco: params.disco,
      meter_type: params.meterType,
      meter_number: params.meterNumber,
      amount: params.amount,
      bypass: false,
      'request-id': params.requestId,
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    throw new Error(`QuickVTU electricity payment failed: ${message}`);
  }
};

/**
 * Verifies an electricity meter number before bill payment.
 * Per docs: GET /api/bill/bill-validation?meter_number=...&disco=...&meter_type=...
 *
 * @param meterNumber Customer's meter number
 * @param disco       Disco ID
 * @param meterType   'prepaid' or 'postpaid'
 */
export const verifyMeter = async (
  meterNumber: string,
  disco: number,
  meterType: string,
): Promise<any> => {
  try {
    const client = await getClient();
    const response = await client.get('/bill/bill-validation', {
      params: {
        meter_number: meterNumber,
        disco,
        meter_type: meterType,
      },
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    throw new Error(`QuickVTU meter verification failed: ${message}`);
  }
};

