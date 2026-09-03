import { Request, Response } from 'express';
import Transaction from '../models/Transaction';
import asyncHandler from '../utils/asyncHandler';

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const startOfPrevMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() - 1, 1);

export const getDashboardSummary = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const prevMonthStart = startOfPrevMonth(now);

  const [incomeAgg, expenseAgg, prevIncomeAgg, prevExpenseAgg] = await Promise.all([
    Transaction.aggregate([
      {
        $match: {
          recipientId: userId,
          status: 'APPROVED',
          createdAt: { $gte: thisMonthStart },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Transaction.aggregate([
      {
        $match: {
          senderId: userId,
          status: 'APPROVED',
          createdAt: { $gte: thisMonthStart },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Transaction.aggregate([
      {
        $match: {
          recipientId: userId,
          status: 'APPROVED',
          createdAt: { $gte: prevMonthStart, $lt: thisMonthStart },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Transaction.aggregate([
      {
        $match: {
          senderId: userId,
          status: 'APPROVED',
          createdAt: { $gte: prevMonthStart, $lt: thisMonthStart },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  const income = incomeAgg[0]?.total || 0;
  const expenses = expenseAgg[0]?.total || 0;
  const prevIncome = prevIncomeAgg[0]?.total || 0;
  const prevExpenses = prevExpenseAgg[0]?.total || 0;

  const pctChange = (current: number, prev: number) => {
    if (prev === 0) return current === 0 ? 0 : 100;
    return ((current - prev) / prev) * 100;
  };

  res.json({
    balance: req.user!.balance,
    income,
    expenses,
    incomeChangePct: pctChange(income, prevIncome),
    expenseChangePct: pctChange(expenses, prevExpenses),
  });
});
