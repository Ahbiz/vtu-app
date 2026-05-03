import mongoose, { Schema, Document } from "mongoose";

/**
 * User Interface for Mongoose Model
 */
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
  transactionPin?: string;
  walletBalance: number;
  isVerified: boolean;
  virtualAccount?: {
    accountNumber: string;
    accountName: string;
    bankName: string;
    customerCode: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose Schema for User Profiles
 */
const UserSchema: Schema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    transactionPin: { type: String },
    walletBalance: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    virtualAccount: {
      accountNumber: { type: String },
      accountName: { type: String },
      bankName: { type: String },
      customerCode: { type: String },
    },
  },
  { timestamps: true },
);

export default mongoose.model<IUser>("User", UserSchema);
