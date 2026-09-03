import express from 'express';
import auth from '../middleware/auth';
import validate from '../middleware/validate';
import { getPayees, createPayee, deletePayee, createPayeeSchema } from '../controllers/payee';

const router = express.Router();

router.get('/', auth, getPayees);
router.post('/', auth, validate(createPayeeSchema), createPayee);
router.delete('/:id', auth, deletePayee);

export default router;
