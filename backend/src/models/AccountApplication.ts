import mongoose, { Document, Schema, Types } from 'mongoose';

export type ApplicationStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'REQUIRES_ADDITIONAL_INFO';

export interface IAccountApplication extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  status: ApplicationStatus;
  // Snapshot of what was collected at signup - kept separate from the live
  // User profile so the compliance record reflects what was actually
  // submitted and reviewed, even if the member later updates their profile.
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  employmentStatus: string;
  occupation: string;
  sourceOfIncome: string;
  // Only the last 4 digits of any identifying number are ever stored - see
  // README for why full SSNs/ID numbers aren't collected in this build.
  ssnLast4: string;
  idType: string;
  idNumberLast4: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
}

const AccountApplicationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'REQUIRES_ADDITIONAL_INFO'],
      default: 'SUBMITTED',
    },
    dateOfBirth: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zip: { type: String, trim: true },
    country: { type: String, trim: true },
    employmentStatus: { type: String, trim: true },
    occupation: { type: String, trim: true },
    sourceOfIncome: { type: String, trim: true },
    ssnLast4: { type: String, trim: true },
    idType: { type: String, trim: true },
    idNumberLast4: { type: String, trim: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AccountApplicationSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IAccountApplication>('AccountApplication', AccountApplicationSchema);
