import crypto from 'crypto';
import { Types } from 'mongoose';
import { ApiError } from '@utils/ApiError';
import { AuthRepository } from '@modules/auth/auth.repository';

import { WorkspaceRepository } from './workspace.repository';
import { CreateWorkspaceDto, UpdateWorkspaceDto, AddMemberDto, UpdateMemberRoleDto } from './workspace.dto';
import { IWorkspace } from './workspace.model';

export class WorkspaceService {
  private workspaceRepository: WorkspaceRepository;
  private authRepository: AuthRepository;

  constructor() {
    this.workspaceRepository = new WorkspaceRepository();
    this.authRepository = new AuthRepository();
  }

  private generateInviteCode(): string {
    return crypto.randomBytes(6).toString('hex');
  }

  async createWorkspace(userId: string, data: CreateWorkspaceDto): Promise<IWorkspace> {
    const inviteCode = this.generateInviteCode();

    const workspace = await this.workspaceRepository.create({
      name: data.name,
      description: data.description,
      owner: new Types.ObjectId(userId),
      inviteCode,
      members: [
        {
          user: new Types.ObjectId(userId),
          role: 'owner',
          joinedAt: new Date(),
        },
      ],
    });

    return this.getWorkspaceById(workspace._id.toString());
  }

  async getUserWorkspaces(userId: string): Promise<IWorkspace[]> {
    return this.workspaceRepository.findAllByUserId(userId);
  }

  async getWorkspaceById(workspaceId: string): Promise<IWorkspace> {
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw ApiError.notFound('Workspace not found');
    }
    return workspace;
  }

  async updateWorkspace(workspaceId: string, data: UpdateWorkspaceDto): Promise<IWorkspace> {
    const workspace = await this.workspaceRepository.update(workspaceId, data);
    if (!workspace) {
      throw ApiError.notFound('Workspace not found');
    }
    return workspace;
  }

  async deleteWorkspace(workspaceId: string): Promise<void> {
    const workspace = await this.workspaceRepository.delete(workspaceId);
    if (!workspace) {
      throw ApiError.notFound('Workspace not found');
    }
  }

  async addMember(workspaceId: string, data: AddMemberDto): Promise<IWorkspace> {
    const user = await this.authRepository.findByEmail(data.email);
    if (!user) {
      throw ApiError.notFound(`User with email ${data.email} not found`);
    }

    const workspace = await this.getWorkspaceById(workspaceId);

    // Check if user is already a member
    const isMember = workspace.members.some((m) => m.user._id.toString() === user._id.toString());
    if (isMember) {
      throw ApiError.conflict('User is already a member of this workspace');
    }

    const updatedWorkspace = await this.workspaceRepository.addMember(workspaceId, {
      user: user._id,
      role: data.role,
    });

    if (!updatedWorkspace) {
      throw ApiError.notFound('Workspace not found');
    }

    return updatedWorkspace;
  }

  async removeMember(workspaceId: string, userId: string, targetUserId: string): Promise<IWorkspace> {
    const workspace = await this.getWorkspaceById(workspaceId);

    if (workspace.owner.toString() === targetUserId) {
      throw ApiError.badRequest('Cannot remove the workspace owner');
    }

    const updatedWorkspace = await this.workspaceRepository.removeMember(workspaceId, targetUserId);
    if (!updatedWorkspace) {
      throw ApiError.notFound('Workspace not found');
    }

    return updatedWorkspace;
  }

  async updateMemberRole(workspaceId: string, targetUserId: string, data: UpdateMemberRoleDto): Promise<IWorkspace> {
    const workspace = await this.getWorkspaceById(workspaceId);

    if (workspace.owner.toString() === targetUserId) {
      throw ApiError.badRequest('Cannot change the role of the workspace owner');
    }

    const updatedWorkspace = await this.workspaceRepository.updateMemberRole(workspaceId, targetUserId, data.role);
    if (!updatedWorkspace) {
      throw ApiError.notFound('Workspace not found');
    }

    return updatedWorkspace;
  }

  async generateNewInviteCode(workspaceId: string): Promise<string> {
    const newCode = this.generateInviteCode();
    const updated = await this.workspaceRepository.updateInviteCode(workspaceId, newCode);
    if (!updated) {
      throw ApiError.notFound('Workspace not found');
    }
    return updated.inviteCode;
  }

  async joinWorkspaceByInvite(userId: string, inviteCode: string): Promise<IWorkspace> {
    const workspace = await this.workspaceRepository.findByInviteCode(inviteCode);
    if (!workspace) {
      throw ApiError.notFound('Invalid or expired invite code');
    }

    // Check if already member
    const isMember = workspace.members.some((m) => m.user.toString() === userId);
    if (isMember) {
      return this.getWorkspaceById(workspace._id.toString());
    }

    const updatedWorkspace = await this.workspaceRepository.addMember(workspace._id.toString(), {
      user: new Types.ObjectId(userId),
      role: 'viewer', // Default role when joining via link
    });

    if (!updatedWorkspace) {
      throw ApiError.notFound('Workspace not found');
    }

    return updatedWorkspace;
  }
}
