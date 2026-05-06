import express from 'express';
import { forgotPassword, loginUser, registerUser, resetPassword, setPin, verifyOtp } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify-otp', verifyOtp);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.post('/set-pin', protect, setPin);

export default router;
