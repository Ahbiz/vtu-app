import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Otp from '../models/Otp';
import User from '../models/User';
import { assignDedicatedVirtualAccountSingleStep } from '../services/paystackService';
import { generateToken } from '../utils/jwt';
import { generateOTP, sendOTP } from '../utils/otpUtils';
/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
      res.status(400).json({ message: 'User with this email or phone already exists' });
      return;
    }

    if (!firstName?.trim() || !lastName?.trim()) {
      res.status(400).json({ message: 'Both first name and last name are required' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
    });

    const otpCode = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Delete any existing OTP for this user before creating a fresh one
    await Otp.deleteOne({ user: user._id, type: 'email_verification' });
    await Otp.create({
      user: user._id,
      code: otpCode,
      type: 'email_verification',
      expiresAt,
    });

    await sendOTP(email, otpCode);

    res.status(201).json({
      message: 'Registration successful. Please verify your account with the OTP sent to your email.',
      userId: user._id,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Verify OTP
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
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

    user.isVerified = true;
    await user.save();

    await Otp.deleteOne({ _id: otpRecord._id });

    // Trigger single-step DVA assignment per Paystack docs.
    // This is asynchronous — Paystack fires dedicatedaccount.assign.success webhook
    // when the account is ready, which saves it to the user record.
    try {
      await assignDedicatedVirtualAccountSingleStep({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
      });
      console.log(`[DVA] Assignment initiated for ${user.email} — awaiting webhook confirmation`);
    } catch (dvaError: any) {
      console.error('[DVA] Failed to initiate virtual account assignment:', dvaError.message);
    }

    const token = generateToken(user._id as any);

    res.status(200).json({
      message: 'Account verified successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        walletBalance: user.walletBalance,
        virtualAccount: user.virtualAccount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Login User
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
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
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        walletBalance: user.walletBalance,
        virtualAccount: user.virtualAccount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Set Transaction PIN
 * @route   POST /api/auth/set-pin
 * @access  Private
 */
export const setPin = async (req: any, res: Response): Promise<void> => {
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
 * @desc    Request password reset OTP
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    // Always return 200 to avoid leaking whether an email is registered
    if (!user) {
      res.status(200).json({ message: 'If that email is registered, a reset code has been sent.' });
      return;
    }

    const otpCode = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await Otp.deleteOne({ user: user._id, type: 'password_reset' });
    await Otp.create({
      user: user._id,
      code: otpCode,
      type: 'password_reset',
      expiresAt,
    });

    await sendOTP(email, otpCode);

    res.status(200).json({ message: 'If that email is registered, a reset code has been sent.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Reset password using OTP
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      res.status(400).json({ message: 'Email, OTP, and new password are required' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
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
    const user = await User.findById(req.user._id).select('-password -transactionPin');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      walletBalance: user.walletBalance,
      virtualAccount: user.virtualAccount,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
