import express from 'express';
import auth from '../middleware/auth';
import validate from '../middleware/validate';
import { transactionLimiter } from '../middleware/rateLimiter';
import {
  createTransaction,
  createExternalTransaction,
  createBankTransfer,
  createP2PTransfer,
  verifyOTP,
  getTransactions,
  createTransactionSchema,
  createExternalTransactionSchema,
  bankTransferSchema,
  p2pTransferSchema,
  verifyOtpSchema,
} from '../controllers/transaction';

const router = express.Router();

router.post('/', auth, transactionLimiter, validate(createTransactionSchema), createTransaction);
router.post('/external', auth, transactionLimiter, validate(createExternalTransactionSchema), createExternalTransaction);
router.post('/bank-transfer', auth, transactionLimiter, validate(bankTransferSchema), createBankTransfer);
router.post('/p2p', auth, transactionLimiter, validate(p2pTransferSchema), createP2PTransfer);
router.post('/verify-otp', auth, validate(verifyOtpSchema), verifyOTP);
router.get('/', auth, getTransactions);

export default router;
