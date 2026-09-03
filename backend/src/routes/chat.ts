import express from 'express';
import optionalAuth from '../middleware/optionalAuth';
import { adminAuth } from '../middleware/auth';
import validate from '../middleware/validate';
import { apiLimiter } from '../middleware/rateLimiter';
import {
  startSession,
  startSessionSchema,
  getMessages,
  sendCustomerMessage,
  sendMessageSchema,
  listSessions,
  sendAdminMessage,
  updateSessionStatus,
  closeSessionSchema,
} from '../controllers/chat';

const router = express.Router();

router.post('/sessions', apiLimiter, optionalAuth, validate(startSessionSchema), startSession);
router.get('/sessions/:sessionId/messages', optionalAuth, getMessages);
router.post('/sessions/:sessionId/messages', apiLimiter, optionalAuth, validate(sendMessageSchema), sendCustomerMessage);

router.get('/admin/sessions', adminAuth, listSessions);
router.get('/admin/sessions/:sessionId/messages', adminAuth, getMessages);
router.post('/admin/sessions/:sessionId/messages', adminAuth, validate(sendMessageSchema), sendAdminMessage);
router.patch('/admin/sessions/:sessionId', adminAuth, validate(closeSessionSchema), updateSessionStatus);

export default router;
