import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISavingsTransaction extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  description: string;
  balanceAfter: number;
  createdAt: Date;
}

const SavingsTransactionSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['DEPOSIT', 'WITHDRAWAL'], required: true },
    amount: { type: Number, required: true },
    description: { type: String, default: '' },
    balanceAfter: { type: Number, required: true },
  },
  { timestamps: true }
);

SavingsTransactionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<ISavingsTransaction>('SavingsTransaction', SavingsTransactionSchema);
