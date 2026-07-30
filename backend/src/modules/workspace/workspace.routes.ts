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

// All workspace routes require authentication
router.use(authenticate);

// Global Workspace Routes
router.post('/', validate(createWorkspaceSchema), createWorkspace);
router.get('/', getWorkspaces);
router.post('/join', validate(joinWorkspaceSchema), joinWorkspace);

// Specific Workspace Routes (Requires resolving workspace role)
router.use('/:id', resolveWorkspaceRole);

router.get('/:id', authorize('viewer'), getWorkspaceById);
router.patch('/:id', authorize('owner'), validate(updateWorkspaceSchema), updateWorkspace);
router.delete('/:id', authorize('owner'), deleteWorkspace);

// Member Management
router.post('/:id/members', authorize('owner'), validate(addMemberSchema), addMember);
router.delete('/:id/members/:userId', authorize('owner'), removeMember);
router.patch('/:id/members/:userId', authorize('owner'), validate(updateMemberRoleSchema), updateMemberRole);

// Invites
router.post('/:id/invite-code', authorize('owner'), regenerateInviteCode);

export default router;
