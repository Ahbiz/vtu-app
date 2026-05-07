import express from 'express';
import { getBalance, getTransactions } from '../controllers/walletController';
import { protect } from '../middleware/auth';

// ─────────────────────────────────────────────────────────────────────────────
// Wallet Routes
//
// All routes require JWT authentication (protect middleware).
// ─────────────────────────────────────────────────────────────────────────────

const router = express.Router();

// GET /api/wallet/balance — current balance + virtual account info
router.get('/balance', protect, getBalance);

// GET /api/wallet/transactions — paginated transaction history
router.get('/transactions', protect, getTransactions);

export default router;
