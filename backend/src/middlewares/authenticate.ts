import { Request, Response, NextFunction } from 'express';

import { ApiError } from '@utils/ApiError';
import { TokenService } from '@services/token.service';
import { AuthRepository } from '@modules/auth/auth.repository';

const tokenService = new TokenService();
const authRepository = new AuthRepository();

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Authentication required');
    }

    const token = authHeader.split(' ')[1];
    const payload = tokenService.verifyAccessToken(token);

    if (payload.isAnonymous) {
      req.user = {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        isAnonymous: true,
      };
      return next();
    }

    const user = await authRepository.findById(payload.id);
    if (!user) {
      throw ApiError.unauthorized('User no longer exists');
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }
    next(ApiError.unauthorized('Invalid or expired token'));
  }
};

export const optionalAuthenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const payload = tokenService.verifyAccessToken(token);

    if (payload.isAnonymous) {
      req.user = {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        isAnonymous: true,
      };
      return next();
    }

    const user = await authRepository.findById(payload.id);
    if (user) {
      req.user = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      };
    }
    next();
  } catch (error) {
    next();
  }
};
