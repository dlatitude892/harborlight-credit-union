import mongoose, { Document, Schema, Types } from 'mongoose';

export type TransferMethod = 'MEMBER' | 'BANK_ACCOUNT' | 'CASH_APP' | 'ZELLE' | 'VENMO' | 'PAYPAL';

export interface ITransaction extends Document {
  _id: Types.ObjectId;
  senderId: Types.ObjectId;
  recipientId?: Types.ObjectId;
  payeeId?: Types.ObjectId;
  method: TransferMethod;
  amount: number;
  currency: string;
  category: string;
  description: string;
  transactionType: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  status: 'PENDING' | 'ON_HOLD' | 'OTP_REQUIRED' | 'OTP_VERIFIED' | 'APPROVED' | 'REJECTED' | 'BLOCKED' | 'CANCELLED';
  reference: string;
  createdAt: Date;
  updatedAt: Date;
  otpRequired: boolean;
  otpVerified: boolean;
  fundsApplied: boolean;
  adminNote?: string;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      // Only present for member-to-member transfers; external transfers debit
      // the sender and settle with the outside institution/app instead.
    },
    payeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Payee',
    },
    method: {
      type: String,
      enum: ['MEMBER', 'BANK_ACCOUNT', 'CASH_APP', 'ZELLE', 'VENMO', 'PAYPAL'],
      default: 'MEMBER',
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    category: {
      type: String,
      default: 'General',
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    transactionType: {
      type: String,
      enum: ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER'],
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ON_HOLD', 'OTP_REQUIRED', 'OTP_VERIFIED', 'APPROVED', 'REJECTED', 'BLOCKED', 'CANCELLED'],
      default: 'PENDING',
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    otpRequired: {
      type: Boolean,
      default: false,
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },
    fundsApplied: {
      // Guards against double-crediting/debiting if a transaction is approved
      // through more than one path (OTP verification, then an admin action).
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    adminNote: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

TransactionSchema.index({ senderId: 1, createdAt: -1 });
TransactionSchema.index({ recipientId: 1, createdAt: -1 });
TransactionSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
