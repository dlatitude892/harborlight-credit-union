import express from 'express';
import auth, { adminAuth } from '../middleware/auth';
import optionalAuth from '../middleware/optionalAuth';
import validate from '../middleware/validate';
import { apiLimiter } from '../middleware/rateLimiter';
import {
  submitLoanApplication,
  submitLoanApplicationSchema,
  listLoanApplications,
  getMyLoanApplications,
  getLoanApplication,
  updateLoanApplicationStatus,
  updateLoanApplicationStatusSchema,
} from '../controllers/loanApplication';

const router = express.Router();

router.post('/', apiLimiter, optionalAuth, validate(submitLoanApplicationSchema), submitLoanApplication);
router.get('/mine', auth, getMyLoanApplications);
router.get('/', adminAuth, listLoanApplications);
router.get('/:id', adminAuth, getLoanApplication);
router.patch('/:id/status', adminAuth, validate(updateLoanApplicationStatusSchema), updateLoanApplicationStatus);

export default router;
