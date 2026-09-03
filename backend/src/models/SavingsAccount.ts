import mongoose, { Document, Schema, Types } from 'mongoose';
import type { AccountStatus } from './User';

export interface ISavingsAccount extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  accountNumber: string;
  balance: number;
  status: AccountStatus;
  apy: number;
  openedAt: Date;
}

const SavingsAccountSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    accountNumber: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['ACTIVE', 'UNDER_REVIEW', 'RESTRICTED', 'FROZEN', 'CLOSED'],
      default: 'ACTIVE',
    },
    apy: { type: Number, default: 4.35 },
  },
  { timestamps: { createdAt: 'openedAt', updatedAt: true } }
);

export default mongoose.model<ISavingsAccount>('SavingsAccount', SavingsAccountSchema);
