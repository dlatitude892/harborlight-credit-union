import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User, { IUser } from '../models/User';
import AccountApplication from '../models/AccountApplication';
import asyncHandler from '../utils/asyncHandler';
import { ApiError } from '../middleware/errorHandler';

export const registerSchema = z.object({
  // Personal
  firstName: z.string().min(1),
  middleName: z.string().optional(),
  lastName: z.string().min(1),
  dateOfBirth: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  // Address
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(1),
  // Account & security
  password: z.string().min(8, 'Password must be at least 8 characters'),
  // Identity / compliance - only the last 4 digits of any identifying number
  // are ever collected or stored. See README for why a full SSN/ID number
  // isn't gathered in this build.
  ssnLast4: z.string().min(4).max(4),
  idType: z.string().min(1),
  idNumberLast4: z.string().min(1).max(4),
  employmentStatus: z.string().min(1),
  occupation: z.string().optional().default(''),
  sourceOfIncome: z.string().optional().default(''),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const generateToken = (userId: string) => {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'secret_key', { expiresIn });
};

const generateAccountNumber = () => `HL-${Math.floor(100000000 + Math.random() * 900000000)}`;

const serializeUser = (user: IUser) => ({
  id: user._id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  accountNumber: user.accountNumber,
  role: user.role,
  accountStatus: user.accountStatus,
  customerNotice: user.customerNotice,
  balance: user.balance,
  createdAt: user.createdAt,
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const {
    firstName,
    middleName,
    lastName,
    dateOfBirth,
    email,
    phone,
    address,
    city,
    state,
    zip,
    country,
    password,
    ssnLast4,
    idType,
    idNumberLast4,
    employmentStatus,
    occupation,
    sourceOfIncome,
  } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'An account with this email already exists');
  }

  // The account is created and usable immediately (checking account active,
  // login works right away) - the compliance snapshot below is tracked in
  // parallel by the Account Applications admin queue, not as a login gate.
  const user = new User({
    email,
    password,
    firstName,
    middleName,
    lastName,
    dateOfBirth,
    phone,
    address,
    city,
    state,
    zip,
    country,
    accountNumber: generateAccountNumber(),
    role: 'CUSTOMER',
    balance: 0,
  });
  await user.save();

  await new AccountApplication({
    userId: user._id,
    status: 'SUBMITTED',
    dateOfBirth,
    address,
    city,
    state,
    zip,
    country,
    employmentStatus,
    occupation,
    sourceOfIncome,
    ssnLast4,
    idType,
    idNumberLast4,
  }).save();

  const token = generateToken(user._id.toString());

  res.status(201).json({ token, user: serializeUser(user) });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(400, 'Invalid credentials');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(400, 'Invalid credentials');
  }

  if (user.accountStatus === 'CLOSED') {
    throw new ApiError(403, 'This account has been closed. Contact customer care for assistance.');
  }

  const token = generateToken(user._id.toString());

  res.json({ token, user: serializeUser(user) });
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json(serializeUser(user));
});
