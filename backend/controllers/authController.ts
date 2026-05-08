import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Otp from '../models/Otp';
import User from '../models/User';
import { assignDedicatedVirtualAccountSingleStep } from '../services/paystackService';
import { generateToken } from '../utils/jwt';
import { generateOTP, sendOTP } from '../utils/otpUtils';

// ─────────────────────────────────────────────────────────────────────────────
// Auth Controller
//
// Handles all authentication and account management operations:
//   - Registration with email OTP verification
//   - Login with JWT token generation
//   - OTP verification + Paystack DVA assignment
//   - OTP resend with rate limiting
//   - Password reset flow (forgot → OTP → reset)
//   - Authenticated password change
//   - Transaction PIN set/change
//   - Profile retrieval
//   - Profile update
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a sanitized user response object.
 * Centralizes the fields returned to the client so every endpoint is consistent.
 * Never leaks password or transactionPin hashes.
 */
const buildUserResponse = (user: any) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  walletBalance: user.walletBalance,
  virtualAccount: user.virtualAccount || null,
  hasTransactionPin: !!user.transactionPin,
});

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 *
 * Body: { firstName, lastName, email, phone, password }
 */
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    // ── Input validation ───────────────────────────────────────────────
    if (!firstName?.trim() || !lastName?.trim()) {
      res.status(400).json({ message: 'Both first name and last name are required' });
      return;
    }

    if (!email?.trim()) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    if (!phone?.trim()) {
      res.status(400).json({ message: 'Phone number is required' });
      return;
    }

    if (!password || password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters' });
      return;
    }

    // Normalize email to lowercase to prevent duplicate accounts with different casing
    const normalizedEmail = email.toLowerCase().trim();

    // ── Check for existing user ────────────────────────────────────────
    const userExists = await User.findOne({ $or: [{ email: normalizedEmail }, { phone }] });
    if (userExists) {
      res.status(400).json({ message: 'User with this email or phone already exists' });
      return;
    }

    // ── Create user ────────────────────────────────────────────────────
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword,
    });

    // ── Generate and send OTP ──────────────────────────────────────────
    const otpCode = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Delete any existing OTP for this user before creating a fresh one
    await Otp.deleteMany({ user: user._id, type: 'email_verification' });
    await Otp.create({
      user: user._id,
      code: otpCode,
      type: 'email_verification',
      expiresAt,
    });

    await sendOTP(normalizedEmail, otpCode);

    res.status(201).json({
      message: 'Registration successful. Please verify your account with the OTP sent to your email.',
      userId: user._id,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Resend OTP for email verification
 * @route   POST /api/auth/resend-otp
 * @access  Public
 *
 * Body: { email }
 */
export const resendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ message: 'Account is already verified' });
      return;
    }

    // Rate limit: prevent spamming — check if last OTP was sent less than 60s ago
    const existingOtp = await Otp.findOne({ user: user._id, type: 'email_verification' });
    if (existingOtp) {
      const secondsSinceCreation = (Date.now() - existingOtp.createdAt.getTime()) / 1000;
      if (secondsSinceCreation < 60) {
        res.status(429).json({ message: 'Please wait before requesting another OTP' });
        return;
      }
    }

    // Delete old OTP and create a fresh one
    await Otp.deleteMany({ user: user._id, type: 'email_verification' });

    const otpCode = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await Otp.create({
      user: user._id,
      code: otpCode,
      type: 'email_verification',
      expiresAt,
    });

    await sendOTP(normalizedEmail, otpCode);

    res.status(200).json({ message: 'OTP resent successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Verify OTP and activate account
 * @route   POST /api/auth/verify-otp
 * @access  Public
 *
 * Body: { email, otp }
 *
 * On success:
 *   - Marks user as verified
 *   - Triggers Paystack DVA assignment (async via webhook)
 *   - Returns JWT token + user profile
 */
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ message: 'Email and OTP are required' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const otpRecord = await Otp.findOne({
      user: user._id,
      code: otp,
      type: 'email_verification',
      // Explicit expiry check — don't rely solely on the TTL index, which runs every ~60s
      expiresAt: { $gt: new Date() },
    });
    if (!otpRecord) {
      res.status(400).json({ message: 'Invalid or expired OTP' });
      return;
    }

    // Mark account as verified
    user.isVerified = true;
    await user.save();

    // Clean up used OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    // Trigger single-step DVA assignment per Paystack docs.
    // DVA is only available for businesses that have completed the go-live process.
    // Test keys (sk_test_*) don't have DVA access, so we skip to avoid noisy errors.
    const paystackKey = process.env.PAYSTACK_SECRET_KEY || '';
    const isLiveMode = paystackKey.startsWith('sk_live_');

    if (isLiveMode) {
      try {
        await assignDedicatedVirtualAccountSingleStep({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
        });
        console.log(`[DVA] Assignment initiated for ${user.email} — awaiting webhook confirmation`);
      } catch (dvaError: any) {
        // DVA failure is non-blocking — user can still use the app
        console.error('[DVA] Failed to initiate virtual account assignment:', dvaError.message);
      }
    } else {
      console.log(`[DVA] Skipped — DVA requires a live Paystack key (current key is test mode)`);
    }

    const token = generateToken(user._id as any);

    res.status(200).json({
      message: 'Account verified successfully',
      token,
      user: buildUserResponse(user),
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 *
 * Body: { email, password }
 */
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    if (!user.isVerified) {
      res.status(403).json({ message: 'Please verify your account first.' });
      return;
    }

    const token = generateToken(user._id as any);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: buildUserResponse(user),
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Set transaction PIN (first time or update)
 * @route   POST /api/auth/set-pin
 * @access  Private
 *
 * Body: { pin }  (4-digit string/number)
 */
export const setPin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pin } = req.body;
    const userId = req.user._id;

    // Coerce to string — req.body can deliver numeric values if Content-Type is mishandled
    const pinStr = String(pin ?? '');
    if (!pinStr || pinStr.length !== 4 || !/^\d{4}$/.test(pinStr)) {
      res.status(400).json({ message: 'PIN must be exactly 4 digits' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(pinStr, salt);

    await User.findByIdAndUpdate(userId, { transactionPin: hashedPin });

    res.status(200).json({ message: 'Transaction PIN set successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Change password (authenticated user)
 * @route   POST /api/auth/change-password
 * @access  Private
 *
 * Body: { oldPassword, newPassword }
 */
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      res.status(400).json({ message: 'Old password and new password are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: 'New password must be at least 6 characters' });
      return;
    }

    // Fetch user with password field included (normally excluded by middleware)
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Verify old password matches
    const isMatch = await bcrypt.compare(oldPassword, user.password as string);
    if (!isMatch) {
      res.status(401).json({ message: 'Incorrect old password' });
      return;
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Request password reset OTP
 * @route   POST /api/auth/forgot-password
 * @access  Public
 *
 * Body: { email }
 *
 * Always returns 200 to avoid leaking whether an email is registered.
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Always return 200 to avoid leaking whether an email is registered
    if (!user) {
      res.status(200).json({ message: 'If that email is registered, a reset code has been sent.' });
      return;
    }

    const otpCode = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await Otp.deleteMany({ user: user._id, type: 'password_reset' });
    await Otp.create({
      user: user._id,
      code: otpCode,
      type: 'password_reset',
      expiresAt,
    });

    await sendOTP(normalizedEmail, otpCode);

    res.status(200).json({ message: 'If that email is registered, a reset code has been sent.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Reset password using OTP
 * @route   POST /api/auth/reset-password
 * @access  Public
 *
 * Body: { email, otp, newPassword }
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      res.status(400).json({ message: 'Email, OTP, and new password are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: 'New password must be at least 6 characters' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const otpRecord = await Otp.findOne({
      user: user._id,
      code: otp,
      type: 'password_reset',
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      res.status(400).json({ message: 'Invalid or expired reset code' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Clean up used OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json(buildUserResponse(user));
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 *
 * Body: { firstName, lastName, phone }  (email cannot be changed)
 */
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, phone } = req.body;
    const userId = req.user._id;

    // Build update object with only provided fields
    const updates: any = {};
    if (firstName?.trim()) updates.firstName = firstName.trim();
    if (lastName?.trim()) updates.lastName = lastName.trim();

    if (phone?.trim()) {
      // Check if phone is already taken by another user
      const phoneExists = await User.findOne({ phone: phone.trim(), _id: { $ne: userId } });
      if (phoneExists) {
        res.status(400).json({ message: 'This phone number is already in use' });
        return;
      }
      updates.phone = phone.trim();
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ message: 'No valid fields to update' });
      return;
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: buildUserResponse(user),
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
