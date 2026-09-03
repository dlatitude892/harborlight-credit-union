import express from 'express';
import { adminAuth } from '../middleware/auth';
import validate from '../middleware/validate';
import { apiLimiter } from '../middleware/rateLimiter';
import {
  submitLoanApplication,
  submitLoanApplicationSchema,
  listLoanApplications,
  getLoanApplication,
  updateLoanApplicationStatus,
  updateLoanApplicationStatusSchema,
} from '../controllers/loanApplication';

const router = express.Router();

router.post('/', apiLimiter, validate(submitLoanApplicationSchema), submitLoanApplication);
router.get('/', adminAuth, listLoanApplications);
router.get('/:id', adminAuth, getLoanApplication);
router.patch('/:id/status', adminAuth, validate(updateLoanApplicationStatusSchema), updateLoanApplicationStatus);

export default router;
