import mongoose, { Document, Schema, Types } from 'mongoose';

export type AccountRequestType = 'KYC' | 'LIMIT_UPGRADE';
export type AccountRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface IAccountRequest extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: AccountRequestType;
  status: AccountRequestStatus;
  // KYC fields
  idType?: string;
  idNumberLast4?: string;
  idImageUrl?: string;
  // Limit upgrade fields
  requestedLimit?: number;
  reason?: string;
  adminNote?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
}

const AccountRequestSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['KYC', 'LIMIT_UPGRADE'],
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    idType: { type: String, trim: true },
    idNumberLast4: { type: String, trim: true },
    idImageUrl: { type: String },
    requestedLimit: { type: Number },
    reason: { type: String, trim: true },
    adminNote: { type: String, trim: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

AccountRequestSchema.index({ userId: 1, createdAt: -1 });
AccountRequestSchema.index({ type: 1, status: 1, createdAt: -1 });

export default mongoose.model<IAccountRequest>('AccountRequest', AccountRequestSchema);
