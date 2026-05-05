import express from 'express';
import * as paystackController from '../controllers/paystackController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/initialize', protect, paystackController.initialize);
router.get('/verify/:reference', protect, paystackController.verify);

// Not protected by JWT — Paystack's servers call this directly.
// Authenticity is verified via HMAC-SHA512 signature inside the controller.
router.post('/webhook', paystackController.webhook);

export default router;
