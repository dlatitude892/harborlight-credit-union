import { Request, Response } from 'express';
import { z } from 'zod';
import Card from '../models/Card';
import asyncHandler from '../utils/asyncHandler';
import { ApiError } from '../middleware/errorHandler';

export const updateCardSchema = z.object({
  status: z.enum(['ACTIVE', 'FROZEN']).optional(),
  spendingLimit: z.number().positive().optional(),
});

const randomLast4 = () => String(Math.floor(1000 + Math.random() * 9000));

export const getCards = asyncHandler(async (req: Request, res: Response) => {
  let cards = await Card.find({ userId: req.user!._id }).sort({ createdAt: 1 });

  // Issue a default debit card automatically the first time a member views
  // this page, so there's always something to manage without a manual step.
  if (cards.length === 0) {
    const now = new Date();
    const card = new Card({
      userId: req.user!._id,
      cardholderName: `${req.user!.firstName} ${req.user!.lastName}`.toUpperCase(),
      last4: randomLast4(),
      brand: 'VISA',
      cardType: 'DEBIT',
      expMonth: now.getMonth() + 1,
      expYear: now.getFullYear() + 4,
      status: 'ACTIVE',
      spendingLimit: 2500,
    });
    await card.save();
    cards = [card];
  }

  res.json(cards);
});

export const updateCard = asyncHandler(async (req: Request, res: Response) => {
  const card = await Card.findOne({ _id: req.params.id, userId: req.user!._id });
  if (!card) {
    throw new ApiError(404, 'Card not found');
  }

  if (req.body.status) card.status = req.body.status;
  if (req.body.spendingLimit) card.spendingLimit = req.body.spendingLimit;

  await card.save();
  res.json(card);
});
