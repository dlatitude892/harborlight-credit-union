import { Request, Response } from 'express';
import { z } from 'zod';
import Payee from '../models/Payee';
import asyncHandler from '../utils/asyncHandler';
import { ApiError } from '../middleware/errorHandler';

export const createPayeeSchema = z.object({
  method: z.enum(['BANK_ACCOUNT', 'CASH_APP', 'ZELLE', 'VENMO', 'PAYPAL']),
  label: z.string().min(1),
  handle: z.string().min(1),
  bankName: z.string().optional(),
  routingNumber: z.string().optional(),
  accountNumberLast4: z.string().max(4).optional(),
});

export const getPayees = asyncHandler(async (req: Request, res: Response) => {
  const payees = await Payee.find({ userId: req.user!._id }).sort({ createdAt: -1 });
  res.json(payees);
});

export const createPayee = asyncHandler(async (req: Request, res: Response) => {
  const payee = new Payee({ ...req.body, userId: req.user!._id });
  await payee.save();
  res.status(201).json(payee);
});

export const deletePayee = asyncHandler(async (req: Request, res: Response) => {
  const payee = await Payee.findOneAndDelete({ _id: req.params.id, userId: req.user!._id });
  if (!payee) {
    throw new ApiError(404, 'Payee not found');
  }
  res.json({ message: 'Payee removed' });
});
