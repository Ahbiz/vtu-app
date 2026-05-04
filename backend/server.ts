import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import paystackRoutes from './routes/paystackRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database Connection
connectDB();

// Middleware
// [WHAT] - We configure express.json to save a copy of the "raw" body.
// [WHY] - Paystack webhooks need the exact, untouched text to verify the signature.
app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/paystack', paystackRoutes);

// Health Check Endpoint
app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
