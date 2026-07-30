import { Role } from '../../types/common';

export interface CreateWorkspaceDto {
  name: string;
  description?: string;
}

export interface UpdateWorkspaceDto {
  name?: string;
  description?: string;
}

export interface AddMemberDto {
  email: string;
  role: Role;
}

export interface UpdateMemberRoleDto {
  role: Role;
}

export interface JoinWorkspaceDto {
  inviteCode: string;
}
