import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICard extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  cardholderName: string;
  last4: string;
  brand: 'VISA' | 'MASTERCARD';
  cardType: 'DEBIT' | 'CREDIT';
  expMonth: number;
  expYear: number;
  status: 'ACTIVE' | 'FROZEN';
  spendingLimit: number;
  createdAt: Date;
}

const CardSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cardholderName: {
      type: String,
      required: true,
    },
    last4: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      enum: ['VISA', 'MASTERCARD'],
      default: 'VISA',
    },
    cardType: {
      type: String,
      enum: ['DEBIT', 'CREDIT'],
      default: 'DEBIT',
    },
    expMonth: {
      type: Number,
      required: true,
    },
    expYear: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'FROZEN'],
      default: 'ACTIVE',
    },
    spendingLimit: {
      type: Number,
      default: 2500,
    },
  },
  {
    timestamps: true,
  }
);

CardSchema.index({ userId: 1 });

export default mongoose.model<ICard>('Card', CardSchema);
