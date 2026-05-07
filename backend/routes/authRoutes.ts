import express from 'express';
import {
  changePassword,
  forgotPassword,
  getMe,
  loginUser,
  registerUser,
  resendOtp,
  resetPassword,
  setPin,
  updateProfile,
  verifyOtp,
} from '../controllers/authController';
import { protect } from '../middleware/auth';

// ─────────────────────────────────────────────────────────────────────────────
// Auth Routes
//
// Public routes (no JWT required):
//   POST /register        — Create new account
//   POST /verify-otp      — Verify email with OTP
//   POST /resend-otp      — Resend verification OTP
//   POST /login           — Authenticate and get JWT
//   POST /forgot-password — Request password reset OTP
//   POST /reset-password  — Reset password with OTP
//
// Protected routes (JWT required):
//   GET  /me              — Get current user profile
//   PUT  /profile         — Update user profile
//   POST /set-pin         — Set/update transaction PIN
//   POST /change-password — Change password (old + new)
// ─────────────────────────────────────────────────────────────────────────────

const router = express.Router();

// ── Public routes ────────────────────────────────────────────────────────────
router.post('/register', registerUser);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// ── Protected routes ─────────────────────────────────────────────────────────
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/set-pin', protect, setPin);
router.post('/change-password', protect, changePassword);

export default router;
