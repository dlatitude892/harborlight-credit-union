import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface TokenPayload {
  userId: string;
}

const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key') as TokenPayload;
    const user = await User.findById(decoded.userId);
    if (user) req.user = user;
  } catch {
    // Invalid/expired token - proceed as a guest rather than failing the request.
  }
  next();
};

export default optionalAuth;
