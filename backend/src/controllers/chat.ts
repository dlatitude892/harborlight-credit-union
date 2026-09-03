import { Request, Response } from 'express';
import { z } from 'zod';
import ChatSession from '../models/ChatSession';
import ChatMessage from '../models/ChatMessage';
import asyncHandler from '../utils/asyncHandler';
import { ApiError } from '../middleware/errorHandler';

export const startSessionSchema = z.object({
  visitorName: z.string().optional(),
  visitorEmail: z.string().optional(),
});

// Public (optionalAuth) - logged-in members get their name/session reused
// automatically; guests provide a name up front.
export const startSession = asyncHandler(async (req: Request, res: Response) => {
  if (req.user) {
    const existing = await ChatSession.findOne({ userId: req.user._id, status: 'OPEN' }).sort({ createdAt: -1 });
    if (existing) return res.json(existing);

    const session = await ChatSession.create({
      userId: req.user._id,
      visitorName: `${req.user.firstName} ${req.user.lastName}`,
      visitorEmail: req.user.email,
    });
    return res.status(201).json(session);
  }

  const { visitorName, visitorEmail } = req.body;
  if (!visitorName) {
    throw new ApiError(400, 'Name is required to start a chat');
  }

  const session = await ChatSession.create({ visitorName, visitorEmail });
  res.status(201).json(session);
});

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const messages = await ChatMessage.find({ sessionId: req.params.sessionId }).sort({ createdAt: 1 });
  res.json(messages);
});

export const sendMessageSchema = z.object({
  message: z.string().min(1),
});

export const sendCustomerMessage = asyncHandler(async (req: Request, res: Response) => {
  const session = await ChatSession.findById(req.params.sessionId);
  if (!session) {
    throw new ApiError(404, 'Chat session not found');
  }

  const message = await ChatMessage.create({
    sessionId: session._id,
    sender: 'CUSTOMER',
    authorId: req.user?._id,
    message: req.body.message,
  });

  session.lastMessageAt = new Date();
  if (session.status === 'CLOSED') session.status = 'OPEN';
  await session.save();

  res.status(201).json(message);
});

// ---- Admin inbox ----------------------------------------------------------

export const listSessions = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const filter = status ? { status } : {};

  const sessions = await ChatSession.find(filter).sort({ lastMessageAt: -1 }).limit(100);
  res.json(sessions);
});

export const sendAdminMessage = asyncHandler(async (req: Request, res: Response) => {
  const session = await ChatSession.findById(req.params.sessionId);
  if (!session) {
    throw new ApiError(404, 'Chat session not found');
  }

  const message = await ChatMessage.create({
    sessionId: session._id,
    sender: 'ADMIN',
    authorId: req.user!._id,
    message: req.body.message,
  });

  session.lastMessageAt = new Date();
  await session.save();

  res.status(201).json(message);
});

export const closeSessionSchema = z.object({
  status: z.enum(['OPEN', 'CLOSED']),
});

export const updateSessionStatus = asyncHandler(async (req: Request, res: Response) => {
  const session = await ChatSession.findById(req.params.sessionId);
  if (!session) {
    throw new ApiError(404, 'Chat session not found');
  }
  session.status = req.body.status;
  await session.save();
  res.json(session);
});
