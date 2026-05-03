import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import Otp from '../models/Otp';
import { generateOTP, sendOTP } from '../utils/otpUtils';
import { generateToken } from '../utils/jwt';

// @desc    Register new user
// @route   POST /api/auth/register
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    // 1. Check if user already exists (by email or phone)
    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
      res.status(400).json({ message: 'User with this email or phone already exists' });
      return;
    }

    // 2. Hash the password before saving (Security Best Practice)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create the user
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
    });

    // 4. Generate OTP
    const otpCode = generateOTP();

    // 5. Save OTP to DB, valid for 10 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await Otp.create({
      user: user._id,
      code: otpCode,
      type: 'email_verification', // Using email_verification for account verification
      expiresAt,
    });

    // 6. Send OTP
    await sendOTP(phone, otpCode);

    res.status(201).json({
      message: 'Registration successful. Please verify your account with the OTP sent.',
      userId: user._id,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, otp } = req.body;

    // 1. Find the user by phone
    const user = await User.findOne({ phone });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // 2. Find the OTP record for this user
    const otpRecord = await Otp.findOne({ user: user._id, code: otp, type: 'email_verification' });
    if (!otpRecord) {
      res.status(400).json({ message: 'Invalid or expired OTP' });
      return;
    }

    // 3. OTP is correct! Update user to verified
    user.isVerified = true;
    await user.save();

    // 4. Delete the OTP record so it can't be reused
    await Otp.deleteOne({ _id: otpRecord._id });

    // 5. Generate Authentication Token
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

// @desc    Login User
// @route   POST /api/auth/login
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // 2. Check if password matches
    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // 3. Optional: Check if user is verified before allowing login
    if (!user.isVerified) {
      res.status(403).json({ message: 'Please verify your account first.' });
      return;
    }

    // 4. Generate Token
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

// @desc    Set Transaction PIN
// @route   POST /api/auth/set-pin
export const setPin = async (req: any, res: Response): Promise<void> => {
  try {
    const { pin } = req.body;
    const userId = req.user._id; // Extracted from Auth Middleware

    if (!pin || pin.length !== 4) {
      res.status(400).json({ message: 'PIN must be 4 digits' });
      return;
    }

    // Hash the PIN just like a password for security
    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(pin, salt);

    await User.findByIdAndUpdate(userId, { transactionPin: hashedPin });

    res.status(200).json({ message: 'Transaction PIN set successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
