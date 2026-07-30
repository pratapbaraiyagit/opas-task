import { Request, Response } from 'express';
import { asyncHandler } from '@middlewares/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';
import { AuthRepository } from '../auth/auth.repository';
import { ApiError } from '@utils/ApiError';

const authRepository = new AuthRepository(); // Ideally we'd have a UserRepository but we'll re-use AuthRepository for now to not over-complicate since it queries the User model

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: User profile }
 *       401: { description: Unauthorized }
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authRepository.findById(req.user!.id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  res.status(200).json(
    ApiResponse.success({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      verified: user.verified,
    })
  );
});
