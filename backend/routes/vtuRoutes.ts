import express from 'express';
import {
    getDataPlans,
    purchaseAirtime,
    purchaseCable,
    purchaseData,
    purchaseElectricity,
    verifyMeterNumber,
    verifySmartCard,
} from '../controllers/vtuController';
import { protect } from '../middleware/auth';
import { verifyPin } from '../middleware/verifyPin';

const router = express.Router();

// ── Data plans (auth only, no PIN) ────────────────────────────────────────────
router.get('/data/plans', protect, getDataPlans);

// ── Purchase endpoints (auth + PIN) ──────────────────────────────────────────
router.post('/airtime', protect, verifyPin, purchaseAirtime);
router.post('/data', protect, verifyPin, purchaseData);
router.post('/cable', protect, verifyPin, purchaseCable);
router.post('/electricity', protect, verifyPin, purchaseElectricity);

// ── Verification endpoints (auth only) ───────────────────────────────────────
router.get('/verify-iuc', protect, verifySmartCard);
router.get('/verify-meter', protect, verifyMeterNumber);

export default router;
