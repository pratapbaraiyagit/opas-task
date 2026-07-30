import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { env } from '@config/env';
import { JwtAccessPayload, JwtRefreshPayload } from '../types/express';

export class TokenService {
  generateAccessToken(payload: JwtAccessPayload): string {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRY as any,
    });
  }

  generateRefreshToken(payload: JwtRefreshPayload): string {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRY as any,
    });
  }

  verifyAccessToken(token: string): JwtAccessPayload {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAccessPayload;
  }

  verifyRefreshToken(token: string): JwtRefreshPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtRefreshPayload;
  }

  generateRandomToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  generateTokenExpiry(hours: number): Date {
    return new Date(Date.now() + hours * 60 * 60 * 1000);
  }
}
