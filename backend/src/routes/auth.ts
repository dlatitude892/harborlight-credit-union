import express from 'express';
import { register, login, getProfile, registerSchema, loginSchema } from '../controllers/auth';
import auth from '../middleware/auth';
import validate from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';

const router = express.Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.get('/profile', auth, getProfile);

export default router;
