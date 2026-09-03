import { Request, Response } from 'express';
import { z } from 'zod';
import LoanApplication from '../models/LoanApplication';
import AuditLog from '../models/AuditLog';
import asyncHandler from '../utils/asyncHandler';
import { ApiError } from '../middleware/errorHandler';

export const submitLoanApplicationSchema = z.object({
  loanType: z.enum(['HOME', 'HOME_REFINANCE', 'AUTO', 'PERSONAL', 'BUSINESS']),
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  address: z.string().optional(),
  preferredContactMethod: z.string().optional(),
  employer: z.string().optional(),
  annualIncome: z.string().optional(),
  employmentStatus: z.string().optional(),
  requestedAmount: z.number().positive(),
  loanTerm: z.string().optional(),
  purpose: z.string().optional(),
  propertyInfo: z.string().optional(),
  estimatedPropertyValue: z.string().optional(),
  downPayment: z.string().optional(),
  purchaseOrRefinance: z.string().optional(),
  currentMortgageBalance: z.string().optional(),
  currentInterestRate: z.string().optional(),
  remainingLoanTerm: z.string().optional(),
  vehicleType: z.string().optional(),
  newOrUsed: z.string().optional(),
  estimatedVehiclePrice: z.string().optional(),
  creditRange: z.string().optional(),
  businessName: z.string().optional(),
  businessType: z.string().optional(),
  businessAddress: z.string().optional(),
  businessPhone: z.string().optional(),
  businessEmail: z.string().optional(),
  yearsInBusiness: z.string().optional(),
  annualRevenueRange: z.string().optional(),
  numberOfEmployees: z.string().optional(),
  notes: z.string().optional(),
});

const generateReference = () => `LN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

// Public - no auth required, since prospective (non-member) applicants can apply.
export const submitLoanApplication = asyncHandler(async (req: Request, res: Response) => {
  const application = new LoanApplication({
    ...req.body,
    userId: req.user?._id,
    reference: generateReference(),
    status: 'NEW',
  });
  await application.save();

  res.status(201).json({ reference: application.reference, applicationId: application._id });
});

export const listLoanApplications = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const filter = status ? { status } : {};

  const applications = await LoanApplication.find(filter).sort({ createdAt: -1 }).limit(100);
  res.json(applications);
});

export const getLoanApplication = asyncHandler(async (req: Request, res: Response) => {
  const application = await LoanApplication.findById(req.params.id);
  if (!application) {
    throw new ApiError(404, 'Application not found');
  }
  res.json(application);
});

export const updateLoanApplicationStatusSchema = z.object({
  status: z.enum(['NEW', 'IN_REVIEW', 'APPROVED', 'DENIED']),
});

export const updateLoanApplicationStatus = asyncHandler(async (req: Request, res: Response) => {
  const application = await LoanApplication.findById(req.params.id);
  if (!application) {
    throw new ApiError(404, 'Application not found');
  }

  const previous = application.status;
  application.status = req.body.status;
  await application.save();

  await new AuditLog({
    userId: req.user!._id,
    action: 'UPDATE_LOAN_APPLICATION_STATUS',
    details: { applicationId: application._id, reference: application.reference, from: previous, to: application.status },
    ip: req.ip,
    userAgent: req.get('user-agent'),
  }).save();

  res.json(application);
});
