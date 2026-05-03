import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';


// Ensure you have JWT_SECRET in your .env file
const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in the environment variables");
}

export const generateToken = (userId: Types.ObjectId): string => {
  // Sign a new token with the user's ID
  // It will expire in 30 days (for typical mobile apps, you might want long-lived tokens)
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: '30d',
  });
};
