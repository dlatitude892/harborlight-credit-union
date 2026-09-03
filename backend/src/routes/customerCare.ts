import express from 'express';
import { adminAuth } from '../middleware/auth';
import validate from '../middleware/validate';
import { apiLimiter } from '../middleware/rateLimiter';
import {
  submitTicket,
  submitTicketSchema,
  listTickets,
  getTicket,
  updateTicket,
  updateTicketSchema,
  addResponse,
  addResponseSchema,
} from '../controllers/customerCare';

const router = express.Router();

router.post('/', apiLimiter, validate(submitTicketSchema), submitTicket);
router.get('/', adminAuth, listTickets);
router.get('/:id', adminAuth, getTicket);
router.patch('/:id', adminAuth, validate(updateTicketSchema), updateTicket);
router.post('/:id/responses', adminAuth, validate(addResponseSchema), addResponse);

export default router;
