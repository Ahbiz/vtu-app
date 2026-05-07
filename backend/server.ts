import express from 'express';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import notificationRoutes from './routes/notificationRoutes';
import paystackRoutes from './routes/paystackRoutes';
import vtuRoutes from './routes/vtuRoutes';
import walletRoutes from './routes/walletRoutes';

// ─────────────────────────────────────────────────────────────────────────────
// Express Application Entry Point
//
// Route prefix mapping:
//   /api/auth          — Authentication (register, login, OTP, password reset)
//   /api/paystack      — Paystack integration (initialize, verify, webhook)
//   /api/wallet        — Wallet operations (balance, transaction history)
//   /api/vtu           — VTU services (airtime, data, cable, electricity)
//   /api/notifications — In-app notifications
// ─────────────────────────────────────────────────────────────────────────────

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// rawBody is required by the Paystack webhook handler for HMAC-SHA512 signature verification.
// Re-stringifying req.body can alter whitespace and break the signature check.
app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  },
}));

// ── Route Registration ───────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/paystack', paystackRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/vtu', vtuRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/', (_req, res) => {
  res.send('Server is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
