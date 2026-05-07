import bcrypt from 'bcrypt';
import { NextFunction, Response } from 'express';
import { AuthRequest } from './auth';

// ─────────────────────────────────────────────────────────────────────────────
// Transaction PIN Verification Middleware
//
// All purchase endpoints (airtime, data, cable, electricity) require
// the user to confirm their 4-digit transaction PIN before debiting.
// This middleware sits between the auth middleware and the controller,
// ensuring the PIN is valid before allowing the purchase to proceed.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Middleware that verifies the transaction PIN sent in the request body.
 * Expects `req.body.pin` and `req.user` (set by the auth middleware).
 *
 * Usage in routes:
 *   router.post('/buy-airtime', protect, verifyPin, buyAirtime);
 */
export const verifyPin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { pin } = req.body;

    if (!pin) {
      res.status(400).json({ message: 'Transaction PIN is required' });
      return;
    }

    const user = req.user;

    // User has not set a PIN yet — cannot make purchases
    if (!user?.transactionPin) {
      res.status(403).json({ message: 'Please set your transaction PIN before making purchases' });
      return;
    }

    const pinStr = String(pin);
    const isMatch = await bcrypt.compare(pinStr, user.transactionPin);

    if (!isMatch) {
      res.status(401).json({ message: 'Incorrect transaction PIN' });
      return;
    }

    // PIN verified — proceed to the controller
    next();
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
