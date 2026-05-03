import express from 'express';
import { registerUser, verifyOtp, loginUser, setPin } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

/**
 * Public Authentication Routes
 */
router.post('/register', registerUser);
router.post('/verify-otp', verifyOtp);
router.post('/login', loginUser);

/**
 * Protected Authentication Routes
 */
router.post('/set-pin', protect, setPin);

export default router;
