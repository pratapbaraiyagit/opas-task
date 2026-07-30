import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@utils/ApiError';
import { WorkspaceRepository } from '@modules/workspace/workspace.repository';

const workspaceRepository = new WorkspaceRepository();

export const resolveWorkspaceRole = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const workspaceId = req.params.id || req.body.workspaceId;
    if (!workspaceId) {
      // If there's no workspace context, skip setting role
      return next();
    }

    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw ApiError.notFound('Workspace not found');
    }

    const member = workspace.members.find(
      (m) => m.user._id.toString() === req.user!.id,
    );

    if (!member) {
      throw ApiError.forbidden('You do not have access to this workspace');
    }

    req.workspaceRole = member.role;
    next();
  } catch (error) {
    next(error);
  }
};
