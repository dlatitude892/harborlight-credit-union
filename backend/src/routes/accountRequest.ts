import express from 'express';
import auth, { adminAuth } from '../middleware/auth';
import validate from '../middleware/validate';
import {
  createKycRequest,
  createKycRequestSchema,
  createLimitUpgradeRequest,
  createLimitUpgradeSchema,
  getMyRequests,
  listAccountRequests,
  getAccountRequest,
  approveAccountRequest,
  rejectAccountRequest,
  reviewRequestSchema,
} from '../controllers/accountRequest';

const router = express.Router();

router.post('/kyc', auth, validate(createKycRequestSchema), createKycRequest);
router.post('/limit-upgrade', auth, validate(createLimitUpgradeSchema), createLimitUpgradeRequest);
router.get('/', auth, getMyRequests);

router.get('/admin/list', adminAuth, listAccountRequests);
router.get('/admin/:id', adminAuth, getAccountRequest);
router.post('/admin/:id/approve', adminAuth, validate(reviewRequestSchema), approveAccountRequest);
router.post('/admin/:id/reject', adminAuth, validate(reviewRequestSchema), rejectAccountRequest);

export default router;
