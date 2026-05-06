import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import Otp from '../models/Otp';
import User from '../models/User';
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
