import { Router } from 'express';

import { validate } from '@middlewares/validate';
import { authenticate } from '@middlewares/authenticate';
import {
  signup,
  login,
  refresh,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
  getAnonymousToken,
} from './auth.controller';
import {
  signupSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.schema';

const router = Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh); // Cookie based
router.post('/logout', authenticate, logout);

router.get('/verify-email/:token', validate(verifyEmailSchema, 'params'), verifyEmail);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

router.get('/me', authenticate, getMe);
router.post('/anonymous', getAnonymousToken);

export default router;
