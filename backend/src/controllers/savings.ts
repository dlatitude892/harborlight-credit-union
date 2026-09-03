import { Request, Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import User from '../models/User';
import SavingsAccount from '../models/SavingsAccount';
import SavingsTransaction from '../models/SavingsTransaction';
import asyncHandler from '../utils/asyncHandler';
import { ApiError } from '../middleware/errorHandler';

const generateSavingsAccountNumber = () => `HL-SAV-${Math.floor(100000000 + Math.random() * 900000000)}`;

export const getSavingsAccount = asyncHandler(async (req: Request, res: Response) => {
  const account = await SavingsAccount.findOne({ userId: req.user!._id });
  res.json(account);
});

export const openSavingsAccount = asyncHandler(async (req: Request, res: Response) => {
  const existing = await SavingsAccount.findOne({ userId: req.user!._id });
  if (existing) {
    throw new ApiError(400, 'You already have a savings account');
  }

  const account = new SavingsAccount({
    userId: req.user!._id,
    accountNumber: generateSavingsAccountNumber(),
    balance: 0,
    status: 'ACTIVE',
  });
  await account.save();

  res.status(201).json(account);
});

export const getSavingsTransactions = asyncHandler(async (req: Request, res: Response) => {
  const transactions = await SavingsTransaction.find({ userId: req.user!._id }).sort({ createdAt: -1 }).limit(50);
  res.json(transactions);
});

export const savingsTransferSchema = z.object({
  direction: z.enum(['TO_SAVINGS', 'TO_CHECKING']),
  amount: z.number().positive(),
});

export const transferWithSavings = asyncHandler(async (req: Request, res: Response) => {
  const { direction, amount } = req.body;

  const [user, savings] = await Promise.all([User.findById(req.user!._id), SavingsAccount.findOne({ userId: req.user!._id })]);

  if (!user) throw new ApiError(404, 'User not found');
  if (!savings) throw new ApiError(404, 'Open a savings account first');
  if (savings.status !== 'ACTIVE' || user.accountStatus !== 'ACTIVE') {
    throw new ApiError(403, 'One of your accounts is not active');
  }

  if (direction === 'TO_SAVINGS' && user.balance < amount) {
    throw new ApiError(400, 'Insufficient checking balance');
  }
  if (direction === 'TO_CHECKING' && savings.balance < amount) {
    throw new ApiError(400, 'Insufficient savings balance');
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      if (direction === 'TO_SAVINGS') {
        user.balance -= amount;
        savings.balance += amount;
      } else {
        user.balance += amount;
        savings.balance -= amount;
      }
      await user.save({ session });
      await savings.save({ session });

      await new SavingsTransaction({
        userId: user._id,
        type: direction === 'TO_SAVINGS' ? 'DEPOSIT' : 'WITHDRAWAL',
        amount,
        description: direction === 'TO_SAVINGS' ? 'Transfer from checking' : 'Transfer to checking',
        balanceAfter: savings.balance,
      }).save({ session });
    });
  } finally {
    session.endSession();
  }

  res.json({ checkingBalance: user.balance, savingsBalance: savings.balance });
});
