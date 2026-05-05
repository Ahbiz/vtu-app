import express from 'express';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import paystackRoutes from './routes/paystackRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

// rawBody is required by the Paystack webhook handler for HMAC-SHA512 signature verification.
// Re-stringifying req.body can alter whitespace and break the signature check.
app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  },
}));

app.use('/api/auth', authRoutes);
app.use('/api/paystack', paystackRoutes);

app.get('/', (_req, res) => {
  res.send('Server is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
