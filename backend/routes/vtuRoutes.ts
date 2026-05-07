import express from 'express';
import {
  purchaseAirtime,
  purchaseCable,
  purchaseData,
  purchaseElectricity,
  verifyMeterNumber,
  verifySmartCard,
} from '../controllers/vtuController';
import { protect } from '../middleware/auth';
import { verifyPin } from '../middleware/verifyPin';

// ─────────────────────────────────────────────────────────────────────────────
// VTU Routes
//
// Purchase routes require both JWT auth and transaction PIN verification.
// Verification routes (IUC, meter) require only JWT auth — no PIN needed.
// ─────────────────────────────────────────────────────────────────────────────

const router = express.Router();

// ── Purchase endpoints (auth + PIN) ──────────────────────────────────────────
router.post('/airtime', protect, verifyPin, purchaseAirtime);
router.post('/data', protect, verifyPin, purchaseData);
router.post('/cable', protect, verifyPin, purchaseCable);
router.post('/electricity', protect, verifyPin, purchaseElectricity);

// ── Verification endpoints (auth only) ───────────────────────────────────────
router.get('/verify-iuc', protect, verifySmartCard);
router.get('/verify-meter', protect, verifyMeterNumber);

export default router;
