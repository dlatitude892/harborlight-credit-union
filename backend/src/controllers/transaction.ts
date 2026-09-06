import { Request, Response } from 'express';
import { z } from 'zod';
import User from '../models/User';
import Transaction, { ITransaction } from '../models/Transaction';
import Payee from '../models/Payee';
import OTP from '../models/OTP';
import asyncHandler from '../utils/asyncHandler';
import { ApiError } from '../middleware/errorHandler';
import { sendOtpEmail } from '../utils/mailer';

export const createTransactionSchema = z.object({
  recipientAccountNumber: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  transactionType: z.enum(['DEPOSIT', 'WITHDRAWAL', 'TRANSFER']),
  category: z.string().default('General'),
  description: z.string().optional().default(''),
});

export const createExternalTransactionSchema = z.object({
  payeeId: z.string().min(1),
  amount: z.number().positive(),
  category: z.string().default('Bill payment'),
  description: z.string().optional().default(''),
});

export const bankTransferSchema = z.object({
  recipientName: z.string().min(1),
  bankName: z.string().min(1),
  bankAddress: z.string().optional().default(''),
  accountNumber: z.string().min(4),
  routingNumber: z.string().optional().default(''),
  swiftCode: z.string().optional().default(''),
  recipientAddress: z.string().optional().default(''),
  amount: z.number().positive(),
  description: z.string().optional().default(''),
});

export const p2pTransferSchema = z.object({
  method: z.enum(['CASH_APP', 'ZELLE', 'VENMO', 'PAYPAL']),
  recipientName: z.string().min(1),
  handle: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().optional().default(''),
});

export const verifyOtpSchema = z.object({
  transactionId: z.string().min(1),
  otp: z.string().min(4),
});

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Moves funds for a transaction exactly once. Debits the sender always;
 * credits the recipient only for member-to-member transfers (external
 * transfers/bill pay settle outside Harborlight, so there's no recipient
 * account to credit). Safe to call from both the OTP-verification flow and
 * the admin-approval flow because `fundsApplied` guards against double entry.
 */
export const applyTransactionFunds = async (transaction: ITransaction) => {
  if (transaction.fundsApplied) return transaction;

  const session = await Transaction.startSession();
  try {
    await session.withTransaction(async () => {
      await User.findByIdAndUpdate(transaction.senderId, { $inc: { balance: -transaction.amount } }, { session });

      if (transaction.method === 'MEMBER' && transaction.recipientId) {
        await User.findByIdAndUpdate(transaction.recipientId, { $inc: { balance: transaction.amount } }, { session });
      }

      transaction.status = 'APPROVED';
      transaction.fundsApplied = true;
      transaction.approvedAt = new Date();
      await transaction.save({ session });
    });
  } finally {
    session.endSession();
  }

  return transaction;
};

const generateReference = () => `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

/**
 * Creates the OTP record for a transaction and sends it to the member's
 * email. Returns the raw code too, purely so it can still be surfaced via
 * `devOtp` in non-production environments for local testing - in production
 * the only way to get the code is the email itself.
 */
const issueOtpFor = async (user: { _id: unknown; email: string }, transaction: ITransaction) => {
  const code = generateOtp();

  await new OTP({
    userId: user._id,
    transactionId: transaction._id,
    otp: code,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  }).save();

  // Fire-and-forget: don't make the customer wait on email/SMTP latency (or a
  // misconfigured SMTP server) before they see the OTP box. sendOtpEmail
  // already catches its own errors internally and logs them - it never
  // throws - so this is safe to leave unawaited.
  sendOtpEmail(user.email, code, transaction.reference, transaction.amount).catch(() => undefined);

  return code;
};

export const createTransaction = asyncHandler(async (req: Request, res: Response) => {
  const { recipientAccountNumber, amount, currency, transactionType, category, description } = req.body;

  const sender = await User.findById(req.user!._id);
  if (!sender || sender.accountStatus !== 'ACTIVE') {
    throw new ApiError(403, 'Account is not active');
  }

  if (transactionType === 'TRANSFER' && sender.balance < amount) {
    throw new ApiError(400, 'Insufficient funds');
  }

  const recipient = await User.findOne({ accountNumber: recipientAccountNumber.trim() });
  if (!recipient) {
    throw new ApiError(404, 'No member found with that member ID');
  }

  if (recipient._id.toString() === sender._id.toString()) {
    throw new ApiError(400, "You can't send money to your own account");
  }

  if (recipient.accountStatus !== 'ACTIVE') {
    throw new ApiError(403, 'Recipient account is not active');
  }

  const transaction = new Transaction({
    senderId: req.user!._id,
    recipientId: recipient._id,
    method: 'MEMBER',
    amount,
    currency,
    category,
    description,
    transactionType,
    reference: generateReference(),
    status: 'OTP_REQUIRED',
    otpRequired: true,
  });

  await transaction.save();

  const otpCode = await issueOtpFor(sender, transaction);

  res.status(201).json({
    transaction,
    // Dev convenience only - in production the code is only ever delivered by email.
    devOtp: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
  });
});

export const createExternalTransaction = asyncHandler(async (req: Request, res: Response) => {
  const { payeeId, amount, category, description } = req.body;

  const sender = await User.findById(req.user!._id);
  if (!sender || sender.accountStatus !== 'ACTIVE') {
    throw new ApiError(403, 'Account is not active');
  }

  if (sender.balance < amount) {
    throw new ApiError(400, 'Insufficient funds');
  }

  const payee = await Payee.findOne({ _id: payeeId, userId: req.user!._id });
  if (!payee) {
    throw new ApiError(404, 'Payee not found');
  }

  const transaction = new Transaction({
    senderId: req.user!._id,
    payeeId,
    method: payee.method,
    amount,
    currency: 'USD',
    category,
    description: description || `${payee.method.replace('_', ' ')} - ${payee.label}`,
    transactionType: 'TRANSFER',
    reference: generateReference(),
    status: 'OTP_REQUIRED',
    otpRequired: true,
  });

  await transaction.save();

  const otpCode = await issueOtpFor(sender, transaction);

  res.status(201).json({
    transaction,
    devOtp: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
  });
});

export const createBankTransfer = asyncHandler(async (req: Request, res: Response) => {
  const {
    recipientName,
    bankName,
    bankAddress,
    accountNumber,
    routingNumber,
    swiftCode,
    recipientAddress,
    amount,
    description,
  } = req.body;

  const sender = await User.findById(req.user!._id);
  if (!sender || sender.accountStatus !== 'ACTIVE') {
    throw new ApiError(403, 'Account is not active');
  }
  if (sender.balance < amount) {
    throw new ApiError(400, 'Insufficient funds');
  }

  const payee = new Payee({
    userId: req.user!._id,
    method: 'BANK_ACCOUNT',
    label: recipientName,
    handle: `${bankName} account`,
    recipientName,
    recipientAddress,
    bankName,
    bankAddress,
    routingNumber,
    swiftCode,
    accountNumberLast4: accountNumber.slice(-4),
  });
  await payee.save();

  const transaction = new Transaction({
    senderId: req.user!._id,
    payeeId: payee._id,
    method: 'BANK_ACCOUNT',
    amount,
    currency: 'USD',
    category: 'Bank transfer',
    description: description || `Wire to ${recipientName} - ${bankName}`,
    transactionType: 'TRANSFER',
    reference: generateReference(),
    status: 'OTP_REQUIRED',
    otpRequired: true,
  });
  await transaction.save();

  const otpCode = await issueOtpFor(sender, transaction);

  res.status(201).json({
    transaction,
    devOtp: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
  });
});

export const createP2PTransfer = asyncHandler(async (req: Request, res: Response) => {
  const { method, recipientName, handle, amount, description } = req.body;

  const sender = await User.findById(req.user!._id);
  if (!sender || sender.accountStatus !== 'ACTIVE') {
    throw new ApiError(403, 'Account is not active');
  }
  if (sender.balance < amount) {
    throw new ApiError(400, 'Insufficient funds');
  }

  const payee = new Payee({
    userId: req.user!._id,
    method,
    label: recipientName,
    handle,
    recipientName,
  });
  await payee.save();

  const transaction = new Transaction({
    senderId: req.user!._id,
    payeeId: payee._id,
    method,
    amount,
    currency: 'USD',
    category: 'Bill payment',
    description: description || `${method.replace('_', ' ')} - ${recipientName}`,
    transactionType: 'TRANSFER',
    reference: generateReference(),
    status: 'OTP_REQUIRED',
    otpRequired: true,
  });
  await transaction.save();

  const otpCode = await issueOtpFor(sender, transaction);

  res.status(201).json({
    transaction,
    devOtp: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
  });
});

export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
  const { transactionId, otp } = req.body;

  const otpRecord = await OTP.findOne({
    transactionId,
    userId: req.user!._id,
    verified: false,
    expiresAt: { $gt: new Date() },
  });

  if (!otpRecord) {
    throw new ApiError(400, 'Invalid or expired OTP');
  }

  if (otpRecord.attempts >= 3) {
    throw new ApiError(400, 'Too many failed attempts');
  }

  if (otp !== otpRecord.otp) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new ApiError(400, 'Invalid OTP');
  }

  otpRecord.verified = true;
  await otpRecord.save();

  const transaction = await Transaction.findById(transactionId);
  if (!transaction) {
    throw new ApiError(404, 'Transaction not found');
  }

  // Identity is confirmed at this point (the OTP proves it's really the
  // account holder), but funds are not moved yet - every transaction now
  // waits for an administrator to review and approve it before it completes.
  transaction.otpVerified = true;
  transaction.status = 'PENDING';
  await transaction.save();

  res.json({ message: 'Identity verified. Your transfer is pending approval.', transaction });
});

export const getTransactions = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const filter = {
    $or: [{ senderId: req.user!._id }, { recipientId: req.user!._id }],
  };

  const transactions = await Transaction.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit)
    .populate('senderId', 'firstName lastName accountNumber')
    .populate('recipientId', 'firstName lastName accountNumber')
    .populate('payeeId', 'label method handle');

  const total = await Transaction.countDocuments(filter);

  res.json({
    transactions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});