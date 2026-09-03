import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

/**
 * Validates req.body against a zod schema and replaces req.body with the
 * parsed (and type-coerced) result. Validation errors are forwarded to the
 * centralized error handler.
 */
const validate =
  (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };

export default validate;
