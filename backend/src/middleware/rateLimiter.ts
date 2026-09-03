import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';

/**
 * In-memory rate limiter. For a multi-instance deployment, swap
 * RateLimiterMemory for RateLimiterRedis backed by a shared Redis instance.
 */
const buildLimiter = (points: number, durationSeconds: number) => {
  const limiter = new RateLimiterMemory({ points, duration: durationSeconds });

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    limiter
      .consume(key)
      .then(() => next())
      .catch(() => {
        res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
      });
  };
};

// Tighter limit on auth endpoints to slow down credential stuffing / brute force
export const authLimiter = buildLimiter(10, 60);

// Slightly looser limit on money-movement endpoints
export const transactionLimiter = buildLimiter(20, 60);

// General API limiter applied globally
export const apiLimiter = buildLimiter(100, 60);
