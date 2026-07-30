import { Request, Response } from 'express';

import { asyncHandler } from '@middlewares/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';
import { env } from '@config/env';

import { AuthService } from './auth.service';

const authService = new AuthService();

const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     tags: [Auth]
 *     summary: Create a new account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, confirmPassword]
 *             properties:
 *               name: { type: string, example: John Doe }
 *               email: { type: string, example: john@example.com }
 *               password: { type: string, example: Password123 }
 *               confirmPassword: { type: string, example: Password123 }
 *     responses:
 *       201: { description: Account created successfully }
 *       409: { description: Email already exists }
 */
export const signup = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.signup(req.body);
  res.status(201).json(ApiResponse.created(result.user, result.message));
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login to your account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: john@example.com }
 *               password: { type: string, example: Password123 }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);

  // Set refresh token as httpOnly cookie
  res.cookie('refreshToken', result.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

  res.status(200).json(
    ApiResponse.success(
      {
        user: result.user,
        accessToken: result.accessToken,
      },
      'Login successful',
    ),
  );
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     responses:
 *       200: { description: Token refreshed }
 *       401: { description: Invalid refresh token }
 */
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    res.status(401).json({ success: false, message: 'No refresh token provided' });
    return;
  }

  const result = await authService.refreshToken(token);

  // Rotate refresh token
  res.cookie('refreshToken', result.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

  res.status(200).json(
    ApiResponse.success({ accessToken: result.accessToken }, 'Token refreshed'),
  );
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout and invalidate tokens
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Logged out successfully }
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (req.user) {
    await authService.logout(req.user.id);
  }

  res.clearCookie('refreshToken', { ...REFRESH_TOKEN_COOKIE_OPTIONS, maxAge: 0 });
  res.status(200).json(ApiResponse.success(null, 'Logged out successfully'));
});

/**
 * @swagger
 * /api/auth/verify-email/{token}:
 *   get:
 *     tags: [Auth]
 *     summary: Verify email address
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Email verified }
 *       400: { description: Invalid token }
 */
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.verifyEmail(req.params.token);
  res.status(200).json(ApiResponse.success(null, result.message));
});

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request password reset email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, example: john@example.com }
 *     responses:
 *       200: { description: Reset email sent if account exists }
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.forgotPassword(req.body);
  res.status(200).json(ApiResponse.success(null, result.message));
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password with token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password, confirmPassword]
 *             properties:
 *               token: { type: string }
 *               password: { type: string, example: NewPassword123 }
 *               confirmPassword: { type: string, example: NewPassword123 }
 *     responses:
 *       200: { description: Password reset successful }
 *       400: { description: Invalid token }
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.resetPassword(req.body);
  res.status(200).json(ApiResponse.success(null, result.message));
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: User profile }
 *       401: { description: Unauthorized }
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getProfile(req.user!.id);
  res.status(200).json(ApiResponse.success(user));
});

import { v4 as uuidv4 } from 'uuid';
import { TokenService } from '@services/token.service';
const tokenServiceObj = new TokenService();

const ANIMAL_NAMES = ['Fox', 'Bear', 'Rabbit', 'Wolf', 'Eagle', 'Dolphin', 'Tiger', 'Lion', 'Panda', 'Koala', 'Owl'];

export const getAnonymousToken = asyncHandler(async (req: Request, res: Response) => {
  const randomAnimal = ANIMAL_NAMES[Math.floor(Math.random() * ANIMAL_NAMES.length)];
  const name = `Anonymous ${randomAnimal}`;
  const id = uuidv4();
  
  const accessToken = tokenServiceObj.generateAccessToken({
    id,
    email: 'anonymous@opas.com',
    name,
    isAnonymous: true
  });
  
  res.status(200).json(ApiResponse.success({ 
    accessToken, 
    user: { id, name, email: 'anonymous@opas.com', isAnonymous: true } 
  }, 'Anonymous token generated'));
});
