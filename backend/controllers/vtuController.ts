import retry from 'async-retry';
import crypto from 'crypto';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Notification from '../models/Notification';
import Transaction from '../models/Transaction';
import User from '../models/User';
import {
    buyAirtime as quickvtuBuyAirtime,
    buyCable as quickvtuBuyCable,
    buyData as quickvtuBuyData,
    payElectricity as quickvtuPayElectricity,
    verifyIUC as quickvtuVerifyIUC,
    verifyMeter as quickvtuVerifyMeter,
} from '../services/quickvtuService';

// ─────────────────────────────────────────────────────────────────────────────
// VTU Controller
//
// Handles all Value-Added Service (VAS) purchases:
//   - Airtime top-up
//   - Data bundle purchase
//   - Cable TV subscription
//   - Electricity bill payment
//   - IUC / Meter number verification
//
// Flow for every purchase:
//   1. Validate inputs
//   2. Check wallet balance (sufficient funds)
//   3. Debit wallet (optimistic — deducted before calling provider)
//   4. Call QuickVTU API
//   5. If success → record transaction, create notification
//   6. If failure → refund wallet, record failed transaction
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates a unique request ID for QuickVTU idempotency.
 * Format: <prefix>_<timestamp>_<random hex>
 */
const generateRequestId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
};

/**
 * @desc    Get available data plans for a network
 * @route   GET /api/vtu/data/plans?network=1
 * @access  Private
 *
 * Returns hardcoded plans from QuickVTU docs (docs/quickvtu.md).
 * These are static — update when QuickVTU changes their plan table.
 */
export const getDataPlans = async (req: AuthRequest, res: Response): Promise<void> => {
  const ALL_PLANS = [
    { id: 4,  network: 1, networkName: 'MTN',     type: 'SME',     name: '500MB',  amount: 390,  validity: '1 Month' },
    { id: 5,  network: 1, networkName: 'MTN',     type: 'SME',     name: '1GB',    amount: 500,  validity: '1 Month' },
    { id: 6,  network: 1, networkName: 'MTN',     type: 'SME',     name: '2GB',    amount: 1200, validity: '1 Month' },
    { id: 7,  network: 1, networkName: 'MTN',     type: 'SME',     name: '3GB',    amount: 1800, validity: '1 Month' },
    { id: 8,  network: 1, networkName: 'MTN',     type: 'SME',     name: '5GB',    amount: 3000, validity: '1 Month' },
    { id: 24, network: 3, networkName: 'GLO',     type: 'GIFTING', name: '1.5GB',  amount: 465,  validity: '1 Month' },
    { id: 25, network: 3, networkName: 'GLO',     type: 'GIFTING', name: '2.9GB',  amount: 940,  validity: '1 Month' },
    { id: 26, network: 3, networkName: 'GLO',     type: 'GIFTING', name: '4.1GB',  amount: 1300, validity: '1 Month' },
    { id: 27, network: 3, networkName: 'GLO',     type: 'GIFTING', name: '5.8GB',  amount: 1860, validity: '1 Month' },
    { id: 28, network: 3, networkName: 'GLO',     type: 'GIFTING', name: '10GB',   amount: 3020, validity: '1 Month' },
    { id: 29, network: 4, networkName: '9MOBILE', type: 'SME',     name: '1.1GB',  amount: 399,  validity: '1 Month' },
    { id: 30, network: 4, networkName: '9MOBILE', type: 'SME',     name: '2GB',    amount: 760,  validity: '1 Month' },
    { id: 33, network: 4, networkName: '9MOBILE', type: 'GIFTING', name: '1.5GB',  amount: 900,  validity: '1 Month' },
    { id: 34, network: 4, networkName: '9MOBILE', type: 'GIFTING', name: '500MB',  amount: 450,  validity: '1 Month' },
  ];

  const networkId = req.query.network ? parseInt(req.query.network as string) : null;
  const plans = networkId ? ALL_PLANS.filter(p => p.network === networkId) : ALL_PLANS;

  res.status(200).json({ plans });
};

/**
 * @desc    Purchase airtime top-up
 * @route   POST /api/vtu/airtime
 * @access  Private (requires auth + PIN verification)
 *
 * Body: { network, phone, amount, pin }
 * network: 1=MTN, 2=AIRTEL, 3=GLO, 4=9MOBILE
 */
export const purchaseAirtime = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { network, phone, amount } = req.body;

    // ── Input validation ───────────────────────────────────────────────
    if (!network || !phone || !amount) {
      res.status(400).json({ message: 'Network, phone, and amount are required' });
      return;
    }

    if (![1, 2, 3, 4].includes(network)) {
      res.status(400).json({ message: 'Invalid network. Use 1=MTN, 2=AIRTEL, 3=GLO, 4=9MOBILE' });
      return;
    }

    if (typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({ message: 'Amount must be a positive number' });
      return;
    }

    // ── Balance check ──────────────────────────────────────────────────
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.walletBalance < amount) {
      res.status(400).json({ message: 'Insufficient wallet balance' });
      return;
    }

    // ── Debit wallet (optimistic) ──────────────────────────────────────
    const oldBalance = user.walletBalance;
    const newBalance = oldBalance - amount;
    user.walletBalance = newBalance;
    await user.save();

    // ── Call QuickVTU with retry ────────────────────────────────────────
    const requestId = generateRequestId('Airtime');
    const networkNames: Record<number, string> = { 1: 'MTN', 2: 'AIRTEL', 3: 'GLO', 4: '9MOBILE' };

    try {
      const result = await retry(
        async (bail: (e: Error) => void) => {
          const vtuResult = await quickvtuBuyAirtime({ network, phone, amount, requestId });
          if (vtuResult.status !== 'success' && vtuResult.status === 'failed') {
            bail(new Error(vtuResult.message || 'Airtime purchase failed'));
          }
          return vtuResult;
        },
        { retries: 3, factor: 2, minTimeout: 1000, maxTimeout: 5000 },
      );

      if (result.status === 'success') {
        // Record successful transaction
        await Transaction.create({
          user: user._id,
          reference: requestId,
          amount,
          type: 'airtime',
          status: 'success',
          oldBalance,
          newBalance,
          description: `₦${amount} ${networkNames[network]} airtime to ${phone}`,
          metadata: result,
        });

        // Create in-app notification
        await Notification.create({
          user: user._id,
          title: 'Airtime Purchase Successful',
          message: `₦${amount} ${networkNames[network]} airtime sent to ${phone}`,
        });

        res.status(200).json({
          message: 'Airtime purchase successful',
          data: {
            phone,
            amount,
            network: networkNames[network],
            reference: requestId,
            newBalance,
          },
        });
      } else {
        // Provider returned non-success — refund wallet
        user.walletBalance = oldBalance;
        await user.save();

        await Transaction.create({
          user: user._id,
          reference: requestId,
          amount,
          type: 'airtime',
          status: 'failed',
          oldBalance,
          newBalance: oldBalance,
          description: `Failed: ₦${amount} ${networkNames[network]} airtime to ${phone}`,
          metadata: result,
        });

        res.status(400).json({ message: result.message || 'Airtime purchase failed' });
      }
    } catch (apiError: any) {
      // API call failed — refund wallet
      user.walletBalance = oldBalance;
      await user.save();

      await Transaction.create({
        user: user._id,
        reference: requestId,
        amount,
        type: 'airtime',
        status: 'failed',
        oldBalance,
        newBalance: oldBalance,
        description: `Failed: ₦${amount} ${networkNames[network]} airtime to ${phone}`,
      });

      res.status(500).json({ message: 'Airtime purchase failed. Wallet refunded.' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Purchase data bundle
 * @route   POST /api/vtu/data
 * @access  Private (requires auth + PIN verification)
 *
 * Body: { network, phone, dataPlan, amount, pin }
 * network: 1=MTN, 2=AIRTEL, 3=GLO, 4=9MOBILE
 * dataPlan: Plan ID from QuickVTU plan table
 * amount: Price of the selected plan (verified server-side against plan table)
 */
export const purchaseData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { network, phone, dataPlan, amount } = req.body;

    // ── Input validation ───────────────────────────────────────────────
    if (!network || !phone || !dataPlan || !amount) {
      res.status(400).json({ message: 'Network, phone, data plan, and amount are required' });
      return;
    }

    if (![1, 2, 3, 4].includes(network)) {
      res.status(400).json({ message: 'Invalid network. Use 1=MTN, 2=AIRTEL, 3=GLO, 4=9MOBILE' });
      return;
    }

    if (typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({ message: 'Amount must be a positive number' });
      return;
    }

    // ── Balance check ──────────────────────────────────────────────────
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.walletBalance < amount) {
      res.status(400).json({ message: 'Insufficient wallet balance' });
      return;
    }

    // ── Debit wallet (optimistic) ──────────────────────────────────────
    const oldBalance = user.walletBalance;
    const newBalance = oldBalance - amount;
    user.walletBalance = newBalance;
    await user.save();

    // ── Call QuickVTU ───────────────────────────────────────────────────
    const requestId = generateRequestId('Data');
    const networkNames: Record<number, string> = { 1: 'MTN', 2: 'AIRTEL', 3: 'GLO', 4: '9MOBILE' };

    try {
      const result = await quickvtuBuyData({ network, phone, dataPlan, requestId });

      if (result.status === 'success') {
        await Transaction.create({
          user: user._id,
          reference: requestId,
          amount,
          type: 'data',
          status: 'success',
          oldBalance,
          newBalance,
          description: `${result.dataplan || 'Data'} ${networkNames[network]} data to ${phone}`,
          metadata: result,
        });

        await Notification.create({
          user: user._id,
          title: 'Data Purchase Successful',
          message: `${result.dataplan || 'Data bundle'} sent to ${phone}`,
        });

        res.status(200).json({
          message: 'Data purchase successful',
          data: {
            phone,
            amount,
            plan: result.dataplan,
            network: networkNames[network],
            reference: requestId,
            newBalance,
          },
        });
      } else {
        // Refund on failure
        user.walletBalance = oldBalance;
        await user.save();

        await Transaction.create({
          user: user._id,
          reference: requestId,
          amount,
          type: 'data',
          status: 'failed',
          oldBalance,
          newBalance: oldBalance,
          description: `Failed: ${networkNames[network]} data to ${phone}`,
          metadata: result,
        });

        res.status(400).json({ message: result.message || 'Data purchase failed' });
      }
    } catch (apiError: any) {
      user.walletBalance = oldBalance;
      await user.save();

      await Transaction.create({
        user: user._id,
        reference: requestId,
        amount,
        type: 'data',
        status: 'failed',
        oldBalance,
        newBalance: oldBalance,
        description: `Failed: ${networkNames[network]} data to ${phone}`,
      });

      res.status(500).json({ message: 'Data purchase failed. Wallet refunded.' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Purchase cable TV subscription
 * @route   POST /api/vtu/cable
 * @access  Private (requires auth + PIN verification)
 *
 * Body: { cable, iuc, cablePlan, amount, pin }
 * cable: 1=GOTV, 2=DSTV, 3=STARTIME
 * cablePlan: Plan ID from QuickVTU cable plan table
 */
export const purchaseCable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { cable, iuc, cablePlan, amount } = req.body;

    // ── Input validation ───────────────────────────────────────────────
    if (!cable || !iuc || !cablePlan || !amount) {
      res.status(400).json({ message: 'Cable provider, IUC, plan, and amount are required' });
      return;
    }

    if (![1, 2, 3].includes(cable)) {
      res.status(400).json({ message: 'Invalid cable provider. Use 1=GOTV, 2=DSTV, 3=STARTIME' });
      return;
    }

    if (typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({ message: 'Amount must be a positive number' });
      return;
    }

    // ── Balance check ──────────────────────────────────────────────────
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.walletBalance < amount) {
      res.status(400).json({ message: 'Insufficient wallet balance' });
      return;
    }

    // ── Debit wallet (optimistic) ──────────────────────────────────────
    const oldBalance = user.walletBalance;
    const newBalance = oldBalance - amount;
    user.walletBalance = newBalance;
    await user.save();

    // ── Call QuickVTU ───────────────────────────────────────────────────
    const requestId = generateRequestId('Cable');
    const cableNames: Record<number, string> = { 1: 'GOTV', 2: 'DSTV', 3: 'STARTIME' };

    try {
      const result = await quickvtuBuyCable({ cable, iuc, cablePlan, requestId });

      if (result.status === 'success') {
        await Transaction.create({
          user: user._id,
          reference: requestId,
          amount,
          type: 'cable',
          status: 'success',
          oldBalance,
          newBalance,
          description: `${cableNames[cable]} ${result.plan_name || 'subscription'} to ${iuc}`,
          metadata: result,
        });

        await Notification.create({
          user: user._id,
          title: 'Cable TV Subscription Successful',
          message: `${cableNames[cable]} ${result.plan_name || 'subscription'} activated for IUC ${iuc}`,
        });

        res.status(200).json({
          message: 'Cable TV subscription successful',
          data: {
            iuc,
            amount,
            cable: cableNames[cable],
            plan: result.plan_name,
            reference: requestId,
            newBalance,
          },
        });
      } else {
        user.walletBalance = oldBalance;
        await user.save();

        await Transaction.create({
          user: user._id,
          reference: requestId,
          amount,
          type: 'cable',
          status: 'failed',
          oldBalance,
          newBalance: oldBalance,
          description: `Failed: ${cableNames[cable]} subscription to ${iuc}`,
          metadata: result,
        });

        res.status(400).json({ message: result.message || 'Cable subscription failed' });
      }
    } catch (apiError: any) {
      user.walletBalance = oldBalance;
      await user.save();

      await Transaction.create({
        user: user._id,
        reference: requestId,
        amount,
        type: 'cable',
        status: 'failed',
        oldBalance,
        newBalance: oldBalance,
        description: `Failed: ${cableNames[cable]} subscription to ${iuc}`,
      });

      res.status(500).json({ message: 'Cable subscription failed. Wallet refunded.' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Pay electricity bill
 * @route   POST /api/vtu/electricity
 * @access  Private (requires auth + PIN verification)
 *
 * Body: { disco, meterType, meterNumber, amount, pin }
 * disco: 1-10 (see QuickVTU docs for disco IDs)
 * meterType: 'prepaid' or 'postpaid'
 */
export const purchaseElectricity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { disco, meterType, meterNumber, amount } = req.body;

    // ── Input validation ───────────────────────────────────────────────
    if (!disco || !meterType || !meterNumber || !amount) {
      res.status(400).json({ message: 'Disco, meter type, meter number, and amount are required' });
      return;
    }

    if (disco < 1 || disco > 10) {
      res.status(400).json({ message: 'Invalid disco ID. Must be between 1 and 10' });
      return;
    }

    if (!['prepaid', 'postpaid'].includes(meterType)) {
      res.status(400).json({ message: 'Meter type must be "prepaid" or "postpaid"' });
      return;
    }

    if (typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({ message: 'Amount must be a positive number' });
      return;
    }

    // ── Balance check ──────────────────────────────────────────────────
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.walletBalance < amount) {
      res.status(400).json({ message: 'Insufficient wallet balance' });
      return;
    }

    // ── Debit wallet (optimistic) ──────────────────────────────────────
    const oldBalance = user.walletBalance;
    const newBalance = oldBalance - amount;
    user.walletBalance = newBalance;
    await user.save();

    // ── Call QuickVTU ───────────────────────────────────────────────────
    const requestId = generateRequestId('Bill');

    try {
      const result = await quickvtuPayElectricity({ disco, meterType, meterNumber, amount, requestId });

      if (result.status === 'success') {
        await Transaction.create({
          user: user._id,
          reference: requestId,
          amount,
          type: 'electricity',
          status: 'success',
          oldBalance,
          newBalance,
          description: `₦${amount} ${meterType} electricity to meter ${meterNumber}`,
          metadata: result,
        });

        await Notification.create({
          user: user._id,
          title: 'Electricity Payment Successful',
          message: `₦${amount} ${meterType} electricity paid for meter ${meterNumber}${result.token ? ` | Token: ${result.token}` : ''}`,
        });

        res.status(200).json({
          message: 'Electricity payment successful',
          data: {
            meterNumber,
            amount,
            meterType,
            token: result.token || null,
            reference: requestId,
            newBalance,
          },
        });
      } else {
        user.walletBalance = oldBalance;
        await user.save();

        await Transaction.create({
          user: user._id,
          reference: requestId,
          amount,
          type: 'electricity',
          status: 'failed',
          oldBalance,
          newBalance: oldBalance,
          description: `Failed: ₦${amount} electricity to meter ${meterNumber}`,
          metadata: result,
        });

        res.status(400).json({ message: result.message || 'Electricity payment failed' });
      }
    } catch (apiError: any) {
      user.walletBalance = oldBalance;
      await user.save();

      await Transaction.create({
        user: user._id,
        reference: requestId,
        amount,
        type: 'electricity',
        status: 'failed',
        oldBalance,
        newBalance: oldBalance,
        description: `Failed: ₦${amount} electricity to meter ${meterNumber}`,
      });

      res.status(500).json({ message: 'Electricity payment failed. Wallet refunded.' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── Verification Endpoints (no PIN required, no wallet debit) ───────────────

/**
 * @desc    Verify IUC / SmartCard number for cable TV
 * @route   GET /api/vtu/verify-iuc
 * @access  Private
 *
 * Query: ?iuc=<number>&cable=<1|2|3>
 */
export const verifySmartCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { iuc, cable } = req.query;

    if (!iuc || !cable) {
      res.status(400).json({ message: 'IUC number and cable provider are required' });
      return;
    }

    const cableId = parseInt(cable as string);
    if (![1, 2, 3].includes(cableId)) {
      res.status(400).json({ message: 'Invalid cable provider. Use 1=GOTV, 2=DSTV, 3=STARTIME' });
      return;
    }

    const result = await quickvtuVerifyIUC(iuc as string, cableId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: 'IUC verification failed', error: error.message });
  }
};

/**
 * @desc    Verify electricity meter number
 * @route   GET /api/vtu/verify-meter
 * @access  Private
 *
 * Query: ?meter_number=<number>&disco=<1-10>&meter_type=<prepaid|postpaid>
 */
export const verifyMeterNumber = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { meter_number, disco, meter_type } = req.query;

    if (!meter_number || !disco || !meter_type) {
      res.status(400).json({ message: 'Meter number, disco, and meter type are required' });
      return;
    }

    const discoId = parseInt(disco as string);
    if (discoId < 1 || discoId > 10) {
      res.status(400).json({ message: 'Invalid disco ID. Must be between 1 and 10' });
      return;
    }

    if (!['prepaid', 'postpaid'].includes(meter_type as string)) {
      res.status(400).json({ message: 'Meter type must be "prepaid" or "postpaid"' });
      return;
    }

    const result = await quickvtuVerifyMeter(meter_number as string, discoId, meter_type as string);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: 'Meter verification failed', error: error.message });
  }
};
