import express from 'express';
import auth from '../middleware/auth';
import { getDashboardSummary } from '../controllers/account';

const router = express.Router();

router.get('/summary', auth, getDashboardSummary);

export default router;
