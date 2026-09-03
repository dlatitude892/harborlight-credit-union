import express from 'express';
import auth from '../middleware/auth';
import validate from '../middleware/validate';
import { getSavingsAccount, openSavingsAccount, getSavingsTransactions, transferWithSavings, savingsTransferSchema } from '../controllers/savings';

const router = express.Router();

router.get('/', auth, getSavingsAccount);
router.post('/open', auth, openSavingsAccount);
router.get('/transactions', auth, getSavingsTransactions);
router.post('/transfer', auth, validate(savingsTransferSchema), transferWithSavings);

export default router;
