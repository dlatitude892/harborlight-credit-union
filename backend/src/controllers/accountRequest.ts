import { Request, Response } from 'express';
import { z } from 'zod';
import AccountRequest from '../models/AccountRequest';
import User from '../models/User';
import asyncHandler from '../utils/asyncHandler';
import { ApiError } from '../middleware/errorHandler';

export const createKycRequestSchema = z.object({
  idType: z.string().min(1),
  idNumberLast4: z.string().min(1).max(4),
  idImageUrl: z.string().startsWith('data:image/', 'Must be an image data URL').optional(),
});

export const createKycRequest = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.kycStatus === 'VERIFIED') {
    throw new ApiError(400, 'Your account is already verified');
  }

  const existing = await AccountRequest.findOne({ userId: user._id, type: 'KYC', status: 'PENDING' });
  if (existing) {
    throw new ApiError(400, 'You already have a verification request pending review');
  }

  const request = new AccountRequest({
    userId: user._id,
    type: 'KYC',
    idType: req.body.idType,
    idNumberLast4: req.body.idNumberLast4,
    idImageUrl: req.body.idImageUrl,
  });
  await request.save();

  user.kycStatus = 'PENDING';
  await user.save();

  res.status(201).json(request);
});

export const createLimitUpgradeSchema = z.object({
  requestedLimit: z.number().positive(),
  reason: z.string().optional(),
});

export const createLimitUpgradeRequest = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (req.body.requestedLimit <= user.transactionLimit) {
    throw new ApiError(400, 'Requested limit must be higher than your current limit');
  }

  const existing = await AccountRequest.findOne({ userId: user._id, type: 'LIMIT_UPGRADE', status: 'PENDING' });
  if (existing) {
    throw new ApiError(400, 'You already have a limit upgrade request pending review');
  }

  const request = new AccountRequest({
    userId: user._id,
    type: 'LIMIT_UPGRADE',
    requestedLimit: req.body.requestedLimit,
    reason: req.body.reason,
  });
  await request.save();

  res.status(201).json(request);
});

export const getMyRequests = asyncHandler(async (req: Request, res: Response) => {
  const requests = await AccountRequest.find({ userId: req.user!._id }).sort({ createdAt: -1 }).select('-idImageUrl');
  res.json(requests);
});

// ---- Admin -----------------------------------------------------------------

export const listAccountRequests = asyncHandler(async (req: Request, res: Response) => {
  const type = req.query.type as string | undefined;
  const status = (req.query.status as string) || 'PENDING';

  const filter: Record<string, unknown> = {};
  if (type) filter.type = type;
  if (status !== 'ALL') filter.status = status;

  const requests = await AccountRequest.find(filter)
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('userId', 'firstName lastName accountNumber email transactionLimit kycStatus');

  res.json(requests);
});

export const getAccountRequest = asyncHandler(async (req: Request, res: Response) => {
  const request = await AccountRequest.findById(req.params.id).populate(
    'userId',
    'firstName lastName accountNumber email transactionLimit kycStatus'
  );
  if (!request) {
    throw new ApiError(404, 'Request not found');
  }
  res.json(request);
});

export const reviewRequestSchema = z.object({
  adminNote: z.string().optional(),
});

export const approveAccountRequest = asyncHandler(async (req: Request, res: Response) => {
  const request = await AccountRequest.findById(req.params.id);
  if (!request) {
    throw new ApiError(404, 'Request not found');
  }
  if (request.status !== 'PENDING') {
    throw new ApiError(400, 'Request has already been reviewed');
  }

  const user = await User.findById(request.userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (request.type === 'KYC') {
    user.kycStatus = 'VERIFIED';
  } else if (request.type === 'LIMIT_UPGRADE' && request.requestedLimit) {
    user.transactionLimit = request.requestedLimit;
  }
  await user.save();

  request.status = 'APPROVED';
  request.adminNote = req.body.adminNote;
  request.reviewedBy = req.user!._id;
  request.reviewedAt = new Date();
  await request.save();

  res.json(request);
});

export const rejectAccountRequest = asyncHandler(async (req: Request, res: Response) => {
  const request = await AccountRequest.findById(req.params.id);
  if (!request) {
    throw new ApiError(404, 'Request not found');
  }
  if (request.status !== 'PENDING') {
    throw new ApiError(400, 'Request has already been reviewed');
  }

  if (request.type === 'KYC') {
    const user = await User.findById(request.userId);
    if (user) {
      user.kycStatus = 'REJECTED';
      await user.save();
    }
  }

  request.status = 'REJECTED';
  request.adminNote = req.body.adminNote;
  request.reviewedBy = req.user!._id;
  request.reviewedAt = new Date();
  await request.save();

  res.json(request);
});
