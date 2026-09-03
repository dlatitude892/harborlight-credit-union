import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IOTP extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  transactionId: Types.ObjectId;
  otp: string;
  expiresAt: Date;
  attempts: number;
  verified: boolean;
}

const OTPSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  transactionId: {
    type: Schema.Types.ObjectId,
    ref: 'Transaction',
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model<IOTP>('OTP', OTPSchema);
