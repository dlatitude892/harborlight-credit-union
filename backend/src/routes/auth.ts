import express from 'express';
import {
  register,
  login,
  getProfile,
  registerSchema,
  loginSchema,
  changePassword,
  changePasswordSchema,
  changeEmail,
  changeEmailSchema,
  forgotPassword,
  forgotPasswordSchema,
} from '../controllers/auth';
import auth from '../middleware/auth';
import validate from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';

const router = express.Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.get('/profile', auth, getProfile);
router.patch('/password', auth, authLimiter, validate(changePasswordSchema), changePassword);
router.patch('/email', auth, authLimiter, validate(changeEmailSchema), changeEmail);

export default router;
