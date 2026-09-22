import express from 'express';
import auth, { adminAuth } from '../middleware/auth';
import validate from '../middleware/validate';
import {
  createDeposit,
  createDepositSchema,
  getMyDeposits,
  getMyDepositDetail,
  listDeposits,
  getDeposit,
  approveDeposit,
  approveDepositSchema,
  rejectDeposit,
  rejectDepositSchema,
} from '../controllers/deposit';

const router = express.Router();

router.post('/', auth, validate(createDepositSchema), createDeposit);
router.get('/', auth, getMyDeposits);
router.get('/:id', auth, getMyDepositDetail);

router.get('/admin/list', adminAuth, listDeposits);
router.get('/admin/:id', adminAuth, getDeposit);
router.post('/admin/:id/approve', adminAuth, validate(approveDepositSchema), approveDeposit);
router.post('/admin/:id/reject', adminAuth, validate(rejectDepositSchema), rejectDeposit);

export default router;
