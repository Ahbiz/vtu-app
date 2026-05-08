import mongoose, { Document, Schema } from 'mongoose';

/**
 * Tracks Paystack webhook events that have already been processed.
 * Prevents double-crediting wallets if Paystack retries a webhook.
 * TTL: 24 hours — events older than that are safe to discard.
 */
export interface IProcessedEvent extends Document {
  eventId: string;
  createdAt: Date;
}

const ProcessedEventSchema: Schema = new Schema({
  eventId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

// Auto-delete after 86400 seconds (24 hours)
ProcessedEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export default mongoose.model<IProcessedEvent>('ProcessedEvent', ProcessedEventSchema);
