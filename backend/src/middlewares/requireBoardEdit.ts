import { Request, Response, NextFunction } from 'express';

import { ApiError } from '@utils/ApiError';
import { getBoardAccess } from '@services/boardAccess.service';

export const requireBoardEdit = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const boardId = req.params.id;
    if (!boardId) {
      throw ApiError.badRequest('Board ID is required');
    }

    const access = await getBoardAccess(
      req.user.id,
      !!req.user.isAnonymous,
      boardId,
    );

    if (!access?.canEdit) {
      throw ApiError.forbidden('You do not have permission to edit this board');
    }

    next();
  } catch (error) {
    next(error);
  }
};
