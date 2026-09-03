import { Request, Response } from 'express';
import { z } from 'zod';
import CustomerCareTicket from '../models/CustomerCareTicket';
import AuditLog from '../models/AuditLog';
import asyncHandler from '../utils/asyncHandler';
import { ApiError } from '../middleware/errorHandler';

export const submitTicketSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(1),
  category: z.enum([
    'GENERAL',
    'ACCOUNT_SUPPORT',
    'LOAN_QUESTION',
    'MORTGAGE_QUESTION',
    'ONLINE_BANKING',
    'TECHNICAL_SUPPORT',
    'APPLICATION_STATUS',
    'OTHER',
  ]),
  message: z.string().min(1),
});

// Public - no auth required.
export const submitTicket = asyncHandler(async (req: Request, res: Response) => {
  const ticket = new CustomerCareTicket({
    ...req.body,
    userId: req.user?._id,
    status: 'NEW',
  });
  await ticket.save();

  res.status(201).json({ ticketId: ticket._id });
});

export const listTickets = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const filter = status ? { status } : {};

  const tickets = await CustomerCareTicket.find(filter)
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('assignedTo', 'firstName lastName email');

  res.json(tickets);
});

export const getTicket = asyncHandler(async (req: Request, res: Response) => {
  const ticket = await CustomerCareTicket.findById(req.params.id)
    .populate('assignedTo', 'firstName lastName email')
    .populate('responses.authorId', 'firstName lastName email');

  if (!ticket) {
    throw new ApiError(404, 'Ticket not found');
  }
  res.json(ticket);
});

export const updateTicketSchema = z.object({
  status: z.enum(['NEW', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED']).optional(),
  assignToSelf: z.boolean().optional(),
});

export const updateTicket = asyncHandler(async (req: Request, res: Response) => {
  const ticket = await CustomerCareTicket.findById(req.params.id);
  if (!ticket) {
    throw new ApiError(404, 'Ticket not found');
  }

  const previousStatus = ticket.status;
  if (req.body.status) ticket.status = req.body.status;
  if (req.body.assignToSelf) ticket.assignedTo = req.user!._id;
  await ticket.save();

  await new AuditLog({
    userId: req.user!._id,
    action: 'UPDATE_TICKET',
    details: { ticketId: ticket._id, subject: ticket.subject, from: previousStatus, to: ticket.status },
    ip: req.ip,
    userAgent: req.get('user-agent'),
  }).save();

  res.json(ticket);
});

export const addResponseSchema = z.object({
  message: z.string().min(1),
});

export const addResponse = asyncHandler(async (req: Request, res: Response) => {
  const ticket = await CustomerCareTicket.findById(req.params.id);
  if (!ticket) {
    throw new ApiError(404, 'Ticket not found');
  }

  ticket.responses.push({ authorId: req.user!._id, message: req.body.message, createdAt: new Date() });
  if (ticket.status === 'NEW') ticket.status = 'IN_PROGRESS';
  await ticket.save();

  await new AuditLog({
    userId: req.user!._id,
    action: 'RESPOND_TO_TICKET',
    details: { ticketId: ticket._id, subject: ticket.subject },
    ip: req.ip,
    userAgent: req.get('user-agent'),
  }).save();

  res.status(201).json(ticket);
});
