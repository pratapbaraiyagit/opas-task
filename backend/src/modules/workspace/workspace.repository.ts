import { Types } from 'mongoose';
import { Workspace, IWorkspace, IWorkspaceMember } from './workspace.model';

export class WorkspaceRepository {
  async create(data: Partial<IWorkspace>): Promise<IWorkspace> {
    const workspace = new Workspace(data);
    return workspace.save();
  }

  async findById(id: string): Promise<IWorkspace | null> {
    return Workspace.findById(id).populate('members.user', 'name email avatar');
  }

  async findByInviteCode(inviteCode: string): Promise<IWorkspace | null> {
    return Workspace.findOne({ inviteCode });
  }

  async findAllByUserId(userId: string): Promise<IWorkspace[]> {
    return Workspace.find({ 'members.user': new Types.ObjectId(userId) })
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 });
  }

  async update(id: string, data: Partial<IWorkspace>): Promise<IWorkspace | null> {
    return Workspace.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<IWorkspace | null> {
    return Workspace.findByIdAndDelete(id);
  }

  async addMember(workspaceId: string, member: Omit<IWorkspaceMember, 'joinedAt'>): Promise<IWorkspace | null> {
    return Workspace.findByIdAndUpdate(
      workspaceId,
      {
        $push: { members: { ...member, joinedAt: new Date() } },
      },
      { new: true },
    ).populate('members.user', 'name email avatar');
  }

  async removeMember(workspaceId: string, userId: string): Promise<IWorkspace | null> {
    return Workspace.findByIdAndUpdate(
      workspaceId,
      {
        $pull: { members: { user: new Types.ObjectId(userId) } },
      },
      { new: true },
    ).populate('members.user', 'name email avatar');
  }

  async updateMemberRole(workspaceId: string, userId: string, role: string): Promise<IWorkspace | null> {
    return Workspace.findOneAndUpdate(
      { _id: new Types.ObjectId(workspaceId), 'members.user': new Types.ObjectId(userId) },
      { $set: { 'members.$.role': role } },
      { new: true },
    ).populate('members.user', 'name email avatar');
  }

  async updateInviteCode(workspaceId: string, newCode: string): Promise<IWorkspace | null> {
    return Workspace.findByIdAndUpdate(
      workspaceId,
      { inviteCode: newCode },
      { new: true },
    );
  }
}
