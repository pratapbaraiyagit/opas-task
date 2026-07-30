import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError, ZodEffects } from 'zod';

import { ApiError } from '@utils/ApiError';

type ValidationTarget = 'body' | 'query' | 'params';

export const validate = (schema: AnyZodObject | ZodEffects<AnyZodObject>, target: ValidationTarget = 'body') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req[target]);
      req[target] = data;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        next(ApiError.badRequest('Validation failed', errors));
        return;
      }
      next(error);
    }
  };
};
