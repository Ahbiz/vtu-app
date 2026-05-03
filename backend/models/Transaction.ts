import mongoose, { Schema, Document } from "mongoose";

/**
 * Transaction Interface for Mongoose Model
 */
export interface ITransaction extends Document {
  user: mongoose.Types.ObjectId;
  reference: string;
  amount: number;
  type: "funding" | "airtime" | "data" | "cable" | "electricity" | "transfer";
  status: "pending" | "success" | "failed";
  oldBalance: number;
  newBalance: number;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose Schema for Financial Transactions
 */
const TransactionSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reference: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: ["funding", "airtime", "data", "cable", "electricity", "transfer"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    oldBalance: { type: Number, required: true },
    newBalance: { type: Number, required: true },
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

export default mongoose.model<ITransaction>("Transaction", TransactionSchema);
