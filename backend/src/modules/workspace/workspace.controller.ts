import { Request, Response } from 'express';

import { asyncHandler } from '@middlewares/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';

import { WorkspaceService } from './workspace.service';

const workspaceService = new WorkspaceService();

export const createWorkspace = asyncHandler(async (req: Request, res: Response) => {
  const workspace = await workspaceService.createWorkspace(req.user!.id, req.body);
  res.status(201).json(ApiResponse.created(workspace, 'Workspace created successfully'));
});

export const getWorkspaces = asyncHandler(async (req: Request, res: Response) => {
  const workspaces = await workspaceService.getUserWorkspaces(req.user!.id);
  res.status(200).json(ApiResponse.success(workspaces));
});

export const getWorkspaceById = asyncHandler(async (req: Request, res: Response) => {
  const workspace = await workspaceService.getWorkspaceById(req.params.id);
  res.status(200).json(ApiResponse.success(workspace));
});

export const updateWorkspace = asyncHandler(async (req: Request, res: Response) => {
  const workspace = await workspaceService.updateWorkspace(req.params.id, req.body);
  res.status(200).json(ApiResponse.success(workspace, 'Workspace updated successfully'));
});

export const deleteWorkspace = asyncHandler(async (req: Request, res: Response) => {
  await workspaceService.deleteWorkspace(req.params.id);
  res.status(200).json(ApiResponse.success(null, 'Workspace deleted successfully'));
});

// Member Management
export const addMember = asyncHandler(async (req: Request, res: Response) => {
  const workspace = await workspaceService.addMember(req.params.id, req.body);
  res.status(200).json(ApiResponse.success(workspace, 'Member added successfully'));
});

export const removeMember = asyncHandler(async (req: Request, res: Response) => {
  const workspace = await workspaceService.removeMember(req.params.id, req.user!.id, req.params.userId);
  res.status(200).json(ApiResponse.success(workspace, 'Member removed successfully'));
});

export const updateMemberRole = asyncHandler(async (req: Request, res: Response) => {
  const workspace = await workspaceService.updateMemberRole(req.params.id, req.params.userId, req.body);
  res.status(200).json(ApiResponse.success(workspace, 'Member role updated successfully'));
});

// Invites
export const regenerateInviteCode = asyncHandler(async (req: Request, res: Response) => {
  const inviteCode = await workspaceService.generateNewInviteCode(req.params.id);
  res.status(200).json(ApiResponse.success({ inviteCode }, 'Invite code regenerated successfully'));
});

export const joinWorkspace = asyncHandler(async (req: Request, res: Response) => {
  const workspace = await workspaceService.joinWorkspaceByInvite(req.user!.id, req.body.inviteCode);
  res.status(200).json(ApiResponse.success(workspace, 'Successfully joined workspace'));
});
