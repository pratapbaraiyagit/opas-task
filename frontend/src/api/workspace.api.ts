import { apiClient } from './client';
import { Workspace, ApiResponse, Role } from '../types';

export const workspaceApi = {
  getWorkspaces: async (): Promise<Workspace[]> => {
    const response = await apiClient.get<ApiResponse<Workspace[]>>('/workspaces');
    return response.data.data!;
  },

  getWorkspaceById: async (id: string): Promise<Workspace> => {
    const response = await apiClient.get<ApiResponse<Workspace>>(`/workspaces/${id}`);
    return response.data.data!;
  },

  createWorkspace: async (data: { name: string; description?: string }): Promise<Workspace> => {
    const response = await apiClient.post<ApiResponse<Workspace>>('/workspaces', data);
    return response.data.data!;
  },

  updateWorkspace: async (id: string, data: { name?: string; description?: string }): Promise<Workspace> => {
    const response = await apiClient.patch<ApiResponse<Workspace>>(`/workspaces/${id}`, data);
    return response.data.data!;
  },

  deleteWorkspace: async (id: string): Promise<void> => {
    await apiClient.delete(`/workspaces/${id}`);
  },

  addMember: async (workspaceId: string, data: { email: string; role: Role }): Promise<Workspace> => {
    const response = await apiClient.post<ApiResponse<Workspace>>(`/workspaces/${workspaceId}/members`, data);
    return response.data.data!;
  },

  removeMember: async (workspaceId: string, userId: string): Promise<Workspace> => {
    const response = await apiClient.delete<ApiResponse<Workspace>>(`/workspaces/${workspaceId}/members/${userId}`);
    return response.data.data!;
  },

  updateMemberRole: async (workspaceId: string, userId: string, role: Role): Promise<Workspace> => {
    const response = await apiClient.patch<ApiResponse<Workspace>>(`/workspaces/${workspaceId}/members/${userId}`, { role });
    return response.data.data!;
  },

  regenerateInviteCode: async (workspaceId: string): Promise<string> => {
    const response = await apiClient.post<ApiResponse<{ inviteCode: string }>>(`/workspaces/${workspaceId}/invite-code`);
    return response.data.data!.inviteCode;
  },

  joinWorkspace: async (inviteCode: string): Promise<Workspace> => {
    const response = await apiClient.post<ApiResponse<Workspace>>('/workspaces/join', { inviteCode });
    return response.data.data!;
  },
};
