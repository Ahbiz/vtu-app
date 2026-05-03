import mongoose, { Schema, Document } from "mongoose";

export interface IOtp extends Document {
  user: mongoose.Types.ObjectId;
  code: string;
  type: "email_verification" | "password_reset" | "pin_reset";
  expiresAt: Date;
  createdAt: Date;
}

const OtpSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    code: { type: String, required: true },
    type: {
      type: String,
      enum: ["email_verification", "password_reset", "pin_reset"],
      required: true,
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

// TTL index to automatically delete expired OTP records
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IOtp>("Otp", OtpSchema);
