import mongoose, { Document, Schema, Types } from 'mongoose';

export type CheckDepositStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ICheckDeposit extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  reference: string;
  amount: number;
  imageUrl: string;
  status: CheckDepositStatus;
  adminNote?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
}

const CheckDepositSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    imageUrl: {
      // Stored as a data URL (base64), same approach as profile pictures -
      // no separate file storage service is wired up, and Render's
      // filesystem is ephemeral so disk storage would be lost on redeploy.
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    adminNote: { type: String, trim: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

CheckDepositSchema.index({ userId: 1, createdAt: -1 });
CheckDepositSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<ICheckDeposit>('CheckDeposit', CheckDepositSchema);
