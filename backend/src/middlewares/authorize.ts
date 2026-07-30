import { Request, Response, NextFunction } from 'express';

import { ApiError } from '@utils/ApiError';
import { Role, ROLE_HIERARCHY } from '../types/common';

export const authorize = (requiredRole: Role) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized('Authentication required'));
      return;
    }

    // In a real app, the workspace role might be fetched differently per request.
    // For this boilerplate, we assume `req.workspaceRole` is populated by a previous middleware
    // that checks the user's role in the specific workspace.
    const userRole = req.workspaceRole;

    if (!userRole) {
      next(ApiError.forbidden('Workspace role not found'));
      return;
    }

    if (ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY[requiredRole]) {
      next(ApiError.forbidden(`Requires ${requiredRole} privileges`));
      return;
    }

    next();
  };
};
