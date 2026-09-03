import mongoose, { Document, Schema, Types } from 'mongoose';

export type PayeeMethod = 'BANK_ACCOUNT' | 'CASH_APP' | 'ZELLE' | 'VENMO' | 'PAYPAL';

export interface IPayee extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  method: PayeeMethod;
  label: string;
  handle: string;
  recipientName?: string;
  recipientAddress?: string;
  bankName?: string;
  bankAddress?: string;
  routingNumber?: string;
  swiftCode?: string;
  accountNumberLast4?: string;
  createdAt: Date;
}

const PayeeSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    method: {
      type: String,
      enum: ['BANK_ACCOUNT', 'CASH_APP', 'ZELLE', 'VENMO', 'PAYPAL'],
      required: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    handle: {
      // $Cashtag, Zelle email/phone, Venmo @username, PayPal email, or bank routing shorthand
      type: String,
      required: true,
      trim: true,
    },
    recipientName: {
      type: String,
      trim: true,
    },
    recipientAddress: {
      type: String,
      trim: true,
    },
    bankName: {
      type: String,
      trim: true,
    },
    bankAddress: {
      type: String,
      trim: true,
    },
    routingNumber: {
      type: String,
      trim: true,
    },
    swiftCode: {
      type: String,
      trim: true,
    },
    accountNumberLast4: {
      // Only the last 4 digits are retained after the transfer is created -
      // the full account number is never stored.
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

PayeeSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IPayee>('Payee', PayeeSchema);
