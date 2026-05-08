import mongoose, { Document, Schema } from 'mongoose';

/**
 * Key-value store for runtime configuration.
 * Used to toggle services on/off and set profit margins without redeploying.
 *
 * Seed keys:
 *   airtime_enabled, data_enabled, cable_enabled, electricity_enabled
 *   airtime_profit_margin, data_profit_margin
 */
export interface ISetting extends Document {
  key: string;
  value: any;
  updatedAt: Date;
}

const SettingSchema: Schema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

export default mongoose.model<ISetting>('Setting', SettingSchema);
