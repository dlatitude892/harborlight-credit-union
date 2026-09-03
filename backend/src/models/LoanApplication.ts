import mongoose, { Document, Schema, Types } from 'mongoose';

export type LoanType = 'HOME' | 'HOME_REFINANCE' | 'AUTO' | 'PERSONAL' | 'BUSINESS';
export type LoanApplicationStatus = 'NEW' | 'IN_REVIEW' | 'APPROVED' | 'DENIED';

export interface ILoanApplication extends Document {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  loanType: LoanType;
  reference: string;
  status: LoanApplicationStatus;
  // Applicant info
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  preferredContactMethod?: string;
  // Employment / financial
  employer?: string;
  annualIncome?: string;
  employmentStatus?: string;
  // Loan details (fields used depend on loanType)
  requestedAmount: number;
  loanTerm?: string;
  purpose?: string;
  // Home loan / refinance specific
  propertyInfo?: string;
  estimatedPropertyValue?: string;
  downPayment?: string;
  purchaseOrRefinance?: string;
  currentMortgageBalance?: string;
  currentInterestRate?: string;
  remainingLoanTerm?: string;
  // Auto specific
  vehicleType?: string;
  newOrUsed?: string;
  estimatedVehiclePrice?: string;
  // Personal specific
  creditRange?: string;
  // Business specific
  businessName?: string;
  businessType?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  yearsInBusiness?: string;
  annualRevenueRange?: string;
  numberOfEmployees?: string;
  notes?: string;
  createdAt: Date;
}

const LoanApplicationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    loanType: { type: String, enum: ['HOME', 'HOME_REFINANCE', 'AUTO', 'PERSONAL', 'BUSINESS'], required: true },
    reference: { type: String, required: true, unique: true },
    status: { type: String, enum: ['NEW', 'IN_REVIEW', 'APPROVED', 'DENIED'], default: 'NEW' },

    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    preferredContactMethod: { type: String, trim: true },

    employer: { type: String, trim: true },
    annualIncome: { type: String, trim: true },
    employmentStatus: { type: String, trim: true },

    requestedAmount: { type: Number, required: true },
    loanTerm: { type: String, trim: true },
    purpose: { type: String, trim: true },

    propertyInfo: { type: String, trim: true },
    estimatedPropertyValue: { type: String, trim: true },
    downPayment: { type: String, trim: true },
    purchaseOrRefinance: { type: String, trim: true },
    currentMortgageBalance: { type: String, trim: true },
    currentInterestRate: { type: String, trim: true },
    remainingLoanTerm: { type: String, trim: true },

    vehicleType: { type: String, trim: true },
    newOrUsed: { type: String, trim: true },
    estimatedVehiclePrice: { type: String, trim: true },

    creditRange: { type: String, trim: true },

    businessName: { type: String, trim: true },
    businessType: { type: String, trim: true },
    businessAddress: { type: String, trim: true },
    businessPhone: { type: String, trim: true },
    businessEmail: { type: String, trim: true },
    yearsInBusiness: { type: String, trim: true },
    annualRevenueRange: { type: String, trim: true },
    numberOfEmployees: { type: String, trim: true },

    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

LoanApplicationSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<ILoanApplication>('LoanApplication', LoanApplicationSchema);
