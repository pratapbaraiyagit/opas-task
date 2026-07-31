import { Request, Response, NextFunction } from 'express';

import { ApiError } from '@utils/ApiError';
import { BoardRepository } from '@modules/board/board.repository';
import { WorkspaceRepository } from '@modules/workspace/workspace.repository';

const boardRepository = new BoardRepository();
const workspaceRepository = new WorkspaceRepository();

export const resolveBoardRole = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const boardId = req.params.id;
    if (!boardId) {
      return next();
    }

    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const board = await boardRepository.findById(boardId);
    if (!board) {
      throw ApiError.notFound('Board not found');
    }

    const workspace = await workspaceRepository.findById(board.workspaceId.toString());
    if (!workspace) {
      throw ApiError.notFound('Workspace not found');
    }

    const member = workspace.members.find(
      (m) => m.user._id.toString() === req.user!.id,
    );

    if (!member) {
      throw ApiError.forbidden('You do not have access to this board');
    }

    req.workspaceRole = member.role;
    next();
  } catch (error) {
    next(error);
  }
};
