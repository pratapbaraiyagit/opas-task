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

/**
 * @swagger
 * tags:
 *   name: Boards
 *   description: Board and canvas management
 */

// Global user routes (mounted at /boards)
const singleBoardRouter = Router();

/**
 * @swagger
 * /api/boards/starred:
 *   get:
 *     summary: Get all starred boards for the user
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of starred boards
 */
// VERY IMPORTANT: /starred must come BEFORE /:id to avoid being caught by the ID parameter
singleBoardRouter.get('/starred', authenticate, getStarredBoards);

/**
 * @swagger
 * /api/boards/{id}:
 *   get:
 *     summary: Get a board by ID
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Board details
 *       403:
 *         description: Access denied (Private board)
 *       404:
 *         description: Board not found
 */
// Public board access
singleBoardRouter.get('/:id', optionalAuthenticate, getBoardById);

// All other routes require authentication
singleBoardRouter.use(authenticate);

/**
 * @swagger
 * /api/boards/{id}:
 *   patch:
 *     summary: Update a board
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               thumbnail:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *               publicRole:
 *                 type: string
 *                 enum: [VIEWER, EDITOR]
 *     responses:
 *       200:
 *         description: Board updated successfully
 */
singleBoardRouter.patch('/:id', validate(updateBoardSchema), updateBoard);

/**
 * @swagger
 * /api/boards/{id}:
 *   delete:
 *     summary: Delete a board
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Board deleted successfully
 */
singleBoardRouter.delete('/:id', deleteBoard);

/**
 * @swagger
 * /api/boards/{id}/star:
 *   post:
 *     summary: Toggle star status for a board
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Star status toggled successfully
 */
singleBoardRouter.post('/:id/star', toggleStar);

/**
 * @swagger
 * /api/boards/{id}/share:
 *   patch:
 *     summary: Update board sharing settings
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isPublic:
 *                 type: boolean
 *               publicRole:
 *                 type: string
 *                 enum: [VIEWER, EDITOR]
 *     responses:
 *       200:
 *         description: Board share settings updated
 */
singleBoardRouter.patch('/:id/share', updateBoard); // Re-use updateBoard for sharing

// Workspace specific board routes (mounted at /workspaces/:id/boards)
const workspaceBoardsRouter = Router({ mergeParams: true });

workspaceBoardsRouter.use(authenticate);
workspaceBoardsRouter.use(resolveWorkspaceRole);

/**
 * @swagger
 * /api/workspaces/{id}/boards:
 *   post:
 *     summary: Create a new board in a workspace
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       201:
 *         description: Board created successfully
 */
workspaceBoardsRouter.post('/', authorize('editor'), validate(createBoardSchema), createBoard);

/**
 * @swagger
 * /api/workspaces/{id}/boards:
 *   get:
 *     summary: Get all boards in a workspace
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of boards in the workspace
 */
workspaceBoardsRouter.get('/', authorize('viewer'), getWorkspaceBoards);

export { router as default, workspaceBoardsRouter, singleBoardRouter };
