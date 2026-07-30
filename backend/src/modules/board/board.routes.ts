import { Router } from 'express';

import { validate } from '@middlewares/validate';
import { authenticate } from '@middlewares/authenticate';
import { authorize } from '@middlewares/authorize';
import { resolveWorkspaceRole } from '@middlewares/workspaceRole';

import {
  createBoard,
  getWorkspaceBoards,
  getStarredBoards,
  getBoardById,
  updateBoard,
  deleteBoard,
  toggleStar,
} from './board.controller';
import { createBoardSchema, updateBoardSchema } from './board.schema';

const router = Router();

// All board routes require authentication
router.use(authenticate);

// Global user routes
// These are mounted at /boards
const singleBoardRouter = Router();
singleBoardRouter.use(authenticate);

// VERY IMPORTANT: /starred must come BEFORE /:id to avoid being caught by the ID parameter
singleBoardRouter.get('/starred', getStarredBoards);

// Workspace specific board routes
// The path must include workspaceId for role resolution: /workspaces/:id/boards
const workspaceBoardsRouter = Router({ mergeParams: true });

workspaceBoardsRouter.use(resolveWorkspaceRole);
workspaceBoardsRouter.post('/', authorize('editor'), validate(createBoardSchema), createBoard);
workspaceBoardsRouter.get('/', authorize('viewer'), getWorkspaceBoards);

// Board specific routes (we can check access dynamically in service or via a resolveBoardRole middleware)
// For simplicity, we check in service level for /:id
singleBoardRouter.get('/:id', getBoardById);
singleBoardRouter.patch('/:id', validate(updateBoardSchema), updateBoard);
singleBoardRouter.delete('/:id', deleteBoard);
singleBoardRouter.post('/:id/star', toggleStar);

export { router as default, workspaceBoardsRouter, singleBoardRouter };
