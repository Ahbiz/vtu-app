import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Transaction from '../models/Transaction';
import User from '../models/User';

// ─────────────────────────────────────────────────────────────────────────────
// Wallet Controller
//
// Handles wallet-related operations:
//   - Get current wallet balance and virtual account info
//   - Get paginated transaction history for the authenticated user
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Get authenticated user's wallet balance and virtual account details
 * @route   GET /api/wallet/balance
 * @access  Private
 */
export const getBalance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id).select('walletBalance virtualAccount');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      walletBalance: user.walletBalance,
      virtualAccount: user.virtualAccount || null,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get paginated transaction history for the authenticated user
 * @route   GET /api/wallet/transactions
 * @access  Private
 *
 * Query params:
 *   - page  (default: 1)
 *   - limit (default: 20, max: 50)
 *   - type  (optional filter: "funding", "airtime", "data", "cable", "electricity", "transfer")
 */
export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    // Build filter — always scoped to the authenticated user
    const filter: any = { user: req.user._id };

    // Optional type filter (e.g., ?type=airtime)
    const { type } = req.query;
    if (type && ['funding', 'airtime', 'data', 'cable', 'electricity', 'transfer'].includes(type as string)) {
      filter.type = type;
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Transaction.countDocuments(filter),
    ]);

    res.status(200).json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
