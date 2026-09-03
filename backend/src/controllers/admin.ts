import { Request, Response } from 'express';
import { z } from 'zod';
import User from '../models/User';
import Transaction from '../models/Transaction';
import AuditLog from '../models/AuditLog';
import AccountApplication from '../models/AccountApplication';
import SavingsAccount from '../models/SavingsAccount';
import asyncHandler from '../utils/asyncHandler';
import { ApiError } from '../middleware/errorHandler';
import { applyTransactionFunds } from './transaction';

// Transactions at or above this amount are surfaced for manual review on the
// Flagged Activity screen, in addition to any transaction sitting in a
// held/blocked state.
const LARGE_TRANSACTION_THRESHOLD = 5000;

const logAdminAction = (adminId: unknown, action: string, details: Record<string, unknown>, req: Request) =>
  new AuditLog({
    userId: adminId,
    action,
    details,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  }).save();

export const creditAccountSchema = z.object({
  memberEmail: z.string().email(),
  amount: z.number().positive(),
  note: z.string().optional().default('Credit issued by Harborlight'),
});

export const updateUserStatusSchema = z.object({
  accountStatus: z.enum(['ACTIVE', 'UNDER_REVIEW', 'RESTRICTED', 'FROZEN', 'CLOSED']),
  customerNotice: z.string().optional(),
});

export const addUserNoteSchema = z.object({
  message: z.string().min(1),
});

export const updateTransactionNoteSchema = z.object({
  adminNote: z.string().optional().default(''),
});

export const getAdminSummary = asyncHandler(async (req: Request, res: Response) => {
  const [memberCount, balanceAgg, pendingCount, underReviewCount, pendingApplicationsCount] = await Promise.all([
    User.countDocuments({ role: 'CUSTOMER' }),
    User.aggregate([{ $group: { _id: null, total: { $sum: '$balance' } } }]),
    Transaction.countDocuments({ status: { $in: ['OTP_REQUIRED', 'OTP_VERIFIED', 'PENDING', 'ON_HOLD'] } }),
    User.countDocuments({ accountStatus: 'UNDER_REVIEW' }),
    AccountApplication.countDocuments({ status: { $in: ['SUBMITTED', 'UNDER_REVIEW', 'REQUIRES_ADDITIONAL_INFO'] } }),
  ]);

  res.json({
    memberCount,
    totalBalance: balanceAgg[0]?.total || 0,
    pendingCount,
    underReviewCount,
    pendingApplicationsCount,
  });
});

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const q = (req.query.q as string) || '';
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const filter = q
    ? {
        $or: [
          { firstName: { $regex: q, $options: 'i' } },
          { lastName: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { accountNumber: { $regex: q, $options: 'i' } },
        ],
      }
    : {};

  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(filter);

  res.json({ users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const getUserDetail = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('adminNotes.authorId', 'firstName lastName email');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const [transactions, savingsAccount] = await Promise.all([
    Transaction.find({ $or: [{ senderId: user._id }, { recipientId: user._id }] })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('senderId', 'firstName lastName accountNumber')
      .populate('recipientId', 'firstName lastName accountNumber')
      .populate('payeeId', 'label method handle'),
    SavingsAccount.findOne({ userId: user._id }),
  ]);

  res.json({ user, transactions, savingsAccount });
});

export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const previousStatus = user.accountStatus;
  user.accountStatus = req.body.accountStatus;
  if (req.body.customerNotice !== undefined) {
    user.customerNotice = req.body.customerNotice;
  }
  await user.save();

  await logAdminAction(
    req.user!._id,
    'UPDATE_USER_STATUS',
    { targetUserId: user._id, targetEmail: user.email, from: previousStatus, to: user.accountStatus },
    req
  );

  res.json(user);
});

export const addUserNote = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.adminNotes.push({ authorId: req.user!._id, message: req.body.message, createdAt: new Date() } as never);
  await user.save();

  await logAdminAction(req.user!._id, 'ADD_USER_NOTE', { targetUserId: user._id, targetEmail: user.email }, req);

  const populated = await User.findById(user._id).select('-password').populate('adminNotes.authorId', 'firstName lastName email');
  res.status(201).json(populated);
});

export const creditAccount = asyncHandler(async (req: Request, res: Response) => {
  const { memberEmail, amount, note } = req.body;

  const member = await User.findOne({ email: memberEmail });
  if (!member) {
    throw new ApiError(404, 'No member found with that email');
  }

  const reference = `ADM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const transaction = new Transaction({
    senderId: req.user!._id,
    recipientId: member._id,
    method: 'MEMBER',
    amount,
    currency: 'USD',
    category: 'Credit',
    description: note,
    transactionType: 'DEPOSIT',
    reference,
    status: 'OTP_VERIFIED',
  });
  await transaction.save();

  const applied = await applyTransactionFunds(transaction);

  await logAdminAction(
    req.user!._id,
    'CREDIT_ACCOUNT',
    { targetUserId: member._id, targetEmail: member.email, amount, note, reference },
    req
  );

  res.status(201).json({ transaction: applied });
});

export const listPendingTransactions = asyncHandler(async (req: Request, res: Response) => {
  const transactions = await Transaction.find({
    status: { $in: ['OTP_REQUIRED', 'OTP_VERIFIED', 'PENDING', 'ON_HOLD'] },
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('senderId', 'firstName lastName email accountNumber')
    .populate('recipientId', 'firstName lastName email accountNumber')
    .populate('payeeId', 'label method handle');

  res.json(transactions);
});

export const getFlaggedActivity = asyncHandler(async (req: Request, res: Response) => {
  const [flaggedUsers, largeTransactions, blockedTransactions] = await Promise.all([
    User.find({ accountStatus: { $in: ['UNDER_REVIEW', 'RESTRICTED'] } })
      .select('-password')
      .sort({ updatedAt: -1 }),
    Transaction.find({ amount: { $gte: LARGE_TRANSACTION_THRESHOLD } })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate('senderId', 'firstName lastName email accountNumber')
      .populate('recipientId', 'firstName lastName email accountNumber'),
    Transaction.find({ status: { $in: ['BLOCKED', 'REJECTED'] } })
      .sort({ updatedAt: -1 })
      .limit(30)
      .populate('senderId', 'firstName lastName email accountNumber')
      .populate('recipientId', 'firstName lastName email accountNumber'),
  ]);

  res.json({ flaggedUsers, largeTransactions, blockedTransactions, threshold: LARGE_TRANSACTION_THRESHOLD });
});

export const getAuditLog = asyncHandler(async (req: Request, res: Response) => {
  const entries = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('userId', 'firstName lastName email role');

  res.json(entries);
});

export const approveTransaction = asyncHandler(async (req: Request, res: Response) => {
  const transaction = await Transaction.findById(req.params.id);
  if (!transaction) {
    throw new ApiError(404, 'Transaction not found');
  }

  if (req.body.adminNote) transaction.adminNote = req.body.adminNote;
  transaction.approvedBy = req.user!._id;
  const applied = await applyTransactionFunds(transaction);

  await logAdminAction(req.user!._id, 'APPROVE_TRANSACTION', { transactionId: transaction._id, reference: transaction.reference }, req);

  res.json(applied);
});

export const blockTransaction = asyncHandler(async (req: Request, res: Response) => {
  const transaction = await Transaction.findById(req.params.id);
  if (!transaction) {
    throw new ApiError(404, 'Transaction not found');
  }
  if (transaction.fundsApplied) {
    throw new ApiError(400, 'Funds already moved for this transaction; cannot block');
  }

  transaction.status = 'BLOCKED';
  transaction.approvedBy = req.user!._id;
  if (req.body.adminNote) transaction.adminNote = req.body.adminNote;
  await transaction.save();

  await logAdminAction(req.user!._id, 'BLOCK_TRANSACTION', { transactionId: transaction._id, reference: transaction.reference }, req);

  res.json(transaction);
});

export const rejectTransaction = asyncHandler(async (req: Request, res: Response) => {
  const transaction = await Transaction.findById(req.params.id);
  if (!transaction) {
    throw new ApiError(404, 'Transaction not found');
  }
  if (transaction.fundsApplied) {
    throw new ApiError(400, 'Funds already moved for this transaction; cannot reject');
  }

  transaction.status = 'REJECTED';
  transaction.approvedBy = req.user!._id;
  if (req.body.adminNote) transaction.adminNote = req.body.adminNote;
  await transaction.save();

  await logAdminAction(req.user!._id, 'REJECT_TRANSACTION', { transactionId: transaction._id, reference: transaction.reference }, req);

  res.json(transaction);
});

export const holdTransaction = asyncHandler(async (req: Request, res: Response) => {
  const transaction = await Transaction.findById(req.params.id);
  if (!transaction) {
    throw new ApiError(404, 'Transaction not found');
  }
  if (transaction.fundsApplied) {
    throw new ApiError(400, 'Funds already moved for this transaction; cannot hold');
  }

  transaction.status = 'ON_HOLD';
  if (req.body.adminNote) transaction.adminNote = req.body.adminNote;
  await transaction.save();

  await logAdminAction(req.user!._id, 'HOLD_TRANSACTION', { transactionId: transaction._id, reference: transaction.reference }, req);

  res.json(transaction);
});

export const unblockTransaction = asyncHandler(async (req: Request, res: Response) => {
  const transaction = await Transaction.findById(req.params.id);
  if (!transaction) {
    throw new ApiError(404, 'Transaction not found');
  }
  if (transaction.fundsApplied) {
    throw new ApiError(400, 'Funds already moved for this transaction');
  }
  if (!['BLOCKED', 'REJECTED', 'ON_HOLD'].includes(transaction.status)) {
    throw new ApiError(400, 'Transaction is not blocked, rejected, or on hold');
  }

  transaction.status = 'PENDING';
  await transaction.save();

  await logAdminAction(req.user!._id, 'UNBLOCK_TRANSACTION', { transactionId: transaction._id, reference: transaction.reference }, req);

  res.json(transaction);
});

// ---- Account applications (compliance queue) --------------------------------

export const listApplications = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const filter = status ? { status } : {};

  const applications = await AccountApplication.find(filter)
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('userId', 'firstName lastName email accountNumber accountStatus');

  res.json(applications);
});

export const getApplication = asyncHandler(async (req: Request, res: Response) => {
  const application = await AccountApplication.findById(req.params.id).populate(
    'userId',
    'firstName lastName email accountNumber accountStatus'
  );
  if (!application) {
    throw new ApiError(404, 'Application not found');
  }
  res.json(application);
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'REQUIRES_ADDITIONAL_INFO']),
});

export const updateApplicationStatus = asyncHandler(async (req: Request, res: Response) => {
  const application = await AccountApplication.findById(req.params.id);
  if (!application) {
    throw new ApiError(404, 'Application not found');
  }

  const previous = application.status;
  application.status = req.body.status;
  application.reviewedBy = req.user!._id;
  application.reviewedAt = new Date();
  await application.save();

  await logAdminAction(
    req.user!._id,
    'UPDATE_APPLICATION_STATUS',
    { applicationId: application._id, targetUserId: application.userId, from: previous, to: application.status },
    req
  );

  res.json(application);
});

// ---- Transaction editing & account-date correction ---------------------------
// These are powerful, history-altering actions - every change is captured in
// the audit log with the before/after values, alongside the admin who made it.

export const editTransactionSchema = z.object({
  amount: z.number().positive().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  createdAt: z.string().optional(),
});

export const editTransaction = asyncHandler(async (req: Request, res: Response) => {
  const transaction = await Transaction.findById(req.params.id);
  if (!transaction) {
    throw new ApiError(404, 'Transaction not found');
  }

  const before = {
    amount: transaction.amount,
    description: transaction.description,
    category: transaction.category,
    createdAt: transaction.createdAt,
  };

  const { amount, description, category, createdAt } = req.body;

  // If the transaction's funds were already applied and the amount is
  // changing, correct the affected balance(s) by the difference so the
  // ledger stays consistent with the edited history.
  if (amount !== undefined && amount !== transaction.amount) {
    if (transaction.fundsApplied) {
      const delta = amount - transaction.amount;
      const session = await Transaction.startSession();
      try {
        await session.withTransaction(async () => {
          await User.findByIdAndUpdate(transaction.senderId, { $inc: { balance: -delta } }, { session });
          if (transaction.method === 'MEMBER' && transaction.recipientId) {
            await User.findByIdAndUpdate(transaction.recipientId, { $inc: { balance: delta } }, { session });
          }
          transaction.amount = amount;
          await transaction.save({ session });
        });
      } finally {
        session.endSession();
      }
    } else {
      transaction.amount = amount;
    }
  }

  if (description !== undefined) transaction.description = description;
  if (category !== undefined) transaction.category = category;

  await transaction.save();

  // Mongoose's schema-level "immutable" protection on createdAt has proven
  // unreliable to override through Mongoose's own update options across
  // versions/configurations. Writing through the native MongoDB driver
  // collection instead bypasses Mongoose's schema layer entirely for this
  // one field, so there's nothing left that can silently drop the change.
  if (createdAt !== undefined) {
    await Transaction.collection.updateOne({ _id: transaction._id }, { $set: { createdAt: new Date(createdAt) } });
  }

  const updated = await Transaction.findById(transaction._id);

  await logAdminAction(
    req.user!._id,
    'EDIT_TRANSACTION',
    { transactionId: transaction._id, reference: transaction.reference, before, after: req.body },
    req
  );

  res.json(updated);
});

export const updateAccountCreatedAtSchema = z.object({
  createdAt: z.string().min(1),
});

export const updateAccountCreatedAt = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const before = user.createdAt;

  // Same rationale as the transaction edit above - write through the native
  // driver collection to bypass Mongoose's schema layer entirely.
  await User.collection.updateOne({ _id: user._id }, { $set: { createdAt: new Date(req.body.createdAt) } });
  const updated = await User.findById(user._id);

  await logAdminAction(
    req.user!._id,
    'BACKDATE_ACCOUNT',
    { targetUserId: user._id, targetEmail: user.email, before, after: updated?.createdAt },
    req
  );

  res.json(updated);
});
