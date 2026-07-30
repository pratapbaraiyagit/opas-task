import { Router } from 'express';

import { validate } from '@middlewares/validate';
import { authenticate } from '@middlewares/authenticate';
import { authorize } from '@middlewares/authorize';
import { resolveWorkspaceRole } from '@middlewares/workspaceRole';

import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  addMember,
  removeMember,
  updateMemberRole,
  regenerateInviteCode,
  joinWorkspace,
} from './workspace.controller';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  addMemberSchema,
  updateMemberRoleSchema,
  joinWorkspaceSchema,
} from './workspace.schema';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Workspaces
 *   description: Workspace management and membership
 */

// All workspace routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/workspaces:
 *   post:
 *     summary: Create a new workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               logo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Workspace created successfully
 */
router.post('/', validate(createWorkspaceSchema), createWorkspace);

/**
 * @swagger
 * /api/workspaces:
 *   get:
 *     summary: Get all workspaces for the authenticated user
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of workspaces
 */
router.get('/', getWorkspaces);

/**
 * @swagger
 * /api/workspaces/join:
 *   post:
 *     summary: Join a workspace using an invite code
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inviteCode
 *             properties:
 *               inviteCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully joined workspace
 *       404:
 *         description: Invalid invite code
 */
router.post('/join', validate(joinWorkspaceSchema), joinWorkspace);

// Specific Workspace Routes (Requires resolving workspace role)
router.use('/:id', resolveWorkspaceRole);

/**
 * @swagger
 * /api/workspaces/{id}:
 *   get:
 *     summary: Get a workspace by ID
 *     tags: [Workspaces]
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
 *         description: Workspace details
 *       404:
 *         description: Workspace not found
 */
router.get('/:id', authorize('viewer'), getWorkspaceById);

/**
 * @swagger
 * /api/workspaces/{id}:
 *   patch:
 *     summary: Update a workspace
 *     tags: [Workspaces]
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
 *               name:
 *                 type: string
 *               logo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Workspace updated successfully
 */
router.patch('/:id', authorize('owner'), validate(updateWorkspaceSchema), updateWorkspace);

/**
 * @swagger
 * /api/workspaces/{id}:
 *   delete:
 *     summary: Delete a workspace
 *     tags: [Workspaces]
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
 *         description: Workspace deleted successfully
 */
router.delete('/:id', authorize('owner'), deleteWorkspace);

// Member Management
/**
 * @swagger
 * /api/workspaces/{id}/members:
 *   post:
 *     summary: Add a member to the workspace
 *     tags: [Workspaces]
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
 *               - email
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [owner, editor, viewer]
 *     responses:
 *       200:
 *         description: Member added successfully
 */
router.post('/:id/members', authorize('owner'), validate(addMemberSchema), addMember);

/**
 * @swagger
 * /api/workspaces/{id}/members/{userId}:
 *   delete:
 *     summary: Remove a member from the workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member removed successfully
 */
router.delete('/:id/members/:userId', authorize('owner'), removeMember);

/**
 * @swagger
 * /api/workspaces/{id}/members/{userId}:
 *   patch:
 *     summary: Update a member's role
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
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
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [owner, editor, viewer]
 *     responses:
 *       200:
 *         description: Role updated successfully
 */
router.patch('/:id/members/:userId', authorize('owner'), validate(updateMemberRoleSchema), updateMemberRole);

// Invites
/**
 * @swagger
 * /api/workspaces/{id}/invite-code:
 *   post:
 *     summary: Regenerate the workspace invite code
 *     tags: [Workspaces]
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
 *         description: Invite code regenerated
 */
router.post('/:id/invite-code', authorize('owner'), regenerateInviteCode);

export default router;
