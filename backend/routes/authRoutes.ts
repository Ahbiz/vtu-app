import express from 'express';
import { registerUser, verifyOtp, loginUser, setPin } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify-otp', verifyOtp);
router.post('/login', loginUser);

// Protected routes (require valid JWT token)
router.post('/set-pin', protect, setPin);

export default router;
