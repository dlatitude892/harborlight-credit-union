import { Request, Response } from 'express';
import { z } from 'zod';
import CheckDeposit from '../models/CheckDeposit';
import User from '../models/User';
import Transaction from '../models/Transaction';
import asyncHandler from '../utils/asyncHandler';
import { ApiError } from '../middleware/errorHandler';

const generateReference = () => `DEP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

export const createDepositSchema = z.object({
  amount: z.number().positive(),
  imageUrl: z.string().startsWith('data:image/', 'Must be an image data URL'),
});

export const createDeposit = asyncHandler(async (req: Request, res: Response) => {
  const { amount, imageUrl } = req.body;

  const deposit = new CheckDeposit({
    userId: req.user!._id,
    reference: generateReference(),
    amount,
    imageUrl,
    status: 'PENDING',
  });
  await deposit.save();

  res.status(201).json(deposit);
});

export const getMyDeposits = asyncHandler(async (req: Request, res: Response) => {
  const deposits = await CheckDeposit.find({ userId: req.user!._id }).sort({ createdAt: -1 }).select('-imageUrl');
  res.json(deposits);
});

export const getMyDepositDetail = asyncHandler(async (req: Request, res: Response) => {
  const deposit = await CheckDeposit.findOne({ _id: req.params.id, userId: req.user!._id });
  if (!deposit) {
    throw new ApiError(404, 'Deposit not found');
  }
  res.json(deposit);
});

// ---- Admin -----------------------------------------------------------------

export const listDeposits = asyncHandler(async (req: Request, res: Response) => {
  const status = (req.query.status as string) || 'PENDING';
  const filter = status === 'ALL' ? {} : { status };

  const deposits = await CheckDeposit.find(filter)
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('userId', 'firstName lastName accountNumber email');

  res.json(deposits);
});

export const getDeposit = asyncHandler(async (req: Request, res: Response) => {
  const deposit = await CheckDeposit.findById(req.params.id).populate('userId', 'firstName lastName accountNumber email');
  if (!deposit) {
    throw new ApiError(404, 'Deposit not found');
  }
  res.json(deposit);
});

export const approveDepositSchema = z.object({
  adminNote: z.string().optional(),
});

export const approveDeposit = asyncHandler(async (req: Request, res: Response) => {
  const deposit = await CheckDeposit.findById(req.params.id);
  if (!deposit) {
    throw new ApiError(404, 'Deposit not found');
  }
  if (deposit.status !== 'PENDING') {
    throw new ApiError(400, 'Deposit has already been reviewed');
  }

  const session = await CheckDeposit.startSession();
  try {
    await session.withTransaction(async () => {
      await User.findByIdAndUpdate(deposit.userId, { $inc: { balance: deposit.amount } }, { session });

      deposit.status = 'APPROVED';
      deposit.adminNote = req.body.adminNote;
      deposit.reviewedBy = req.user!._id;
      deposit.reviewedAt = new Date();
      await deposit.save({ session });

      await new Transaction({
        senderId: deposit.userId,
        method: 'CHECK_DEPOSIT',
        amount: deposit.amount,
        currency: 'USD',
        category: 'Check deposit',
        description: `Check deposit ${deposit.reference}`,
        transactionType: 'DEPOSIT',
        reference: deposit.reference,
        status: 'APPROVED',
        fundsApplied: true,
        approvedAt: new Date(),
        approvedBy: req.user!._id,
      }).save({ session });
    });
  } finally {
    session.endSession();
  }

  res.json(deposit);
});

export const rejectDepositSchema = z.object({
  adminNote: z.string().min(1, 'Please explain why this deposit is being rejected'),
});

export const rejectDeposit = asyncHandler(async (req: Request, res: Response) => {
  const deposit = await CheckDeposit.findById(req.params.id);
  if (!deposit) {
    throw new ApiError(404, 'Deposit not found');
  }
  if (deposit.status !== 'PENDING') {
    throw new ApiError(400, 'Deposit has already been reviewed');
  }

  deposit.status = 'REJECTED';
  deposit.adminNote = req.body.adminNote;
  deposit.reviewedBy = req.user!._id;
  deposit.reviewedAt = new Date();
  await deposit.save();

  res.json(deposit);
});
