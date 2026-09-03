import express from 'express';
import auth from '../middleware/auth';
import validate from '../middleware/validate';
import { getCards, updateCard, updateCardSchema } from '../controllers/card';

const router = express.Router();

router.get('/', auth, getCards);
router.patch('/:id', auth, validate(updateCardSchema), updateCard);

export default router;
