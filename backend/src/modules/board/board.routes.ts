import { Router } from 'express';

import { validate } from '@middlewares/validate';
import { authenticate, optionalAuthenticate } from '@middlewares/authenticate';
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

// Global user routes (mounted at /boards)
const singleBoardRouter = Router();

// VERY IMPORTANT: /starred must come BEFORE /:id to avoid being caught by the ID parameter
singleBoardRouter.get('/starred', authenticate, getStarredBoards);

// Public board access
singleBoardRouter.get('/:id', optionalAuthenticate, getBoardById);

// All other routes require authentication
singleBoardRouter.use(authenticate);
singleBoardRouter.patch('/:id', validate(updateBoardSchema), updateBoard);
singleBoardRouter.delete('/:id', deleteBoard);
singleBoardRouter.post('/:id/star', toggleStar);
singleBoardRouter.patch('/:id/share', updateBoard); // Re-use updateBoard for sharing

// Workspace specific board routes (mounted at /workspaces/:id/boards)
const workspaceBoardsRouter = Router({ mergeParams: true });

workspaceBoardsRouter.use(authenticate);
workspaceBoardsRouter.use(resolveWorkspaceRole);
workspaceBoardsRouter.post('/', authorize('editor'), validate(createBoardSchema), createBoard);
workspaceBoardsRouter.get('/', authorize('viewer'), getWorkspaceBoards);

export { router as default, workspaceBoardsRouter, singleBoardRouter };
