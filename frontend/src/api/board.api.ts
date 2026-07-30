import { apiClient } from './client';
import { Board, ApiResponse } from '../types';

export const boardApi = {
  getWorkspaceBoards: async (workspaceId: string): Promise<Board[]> => {
    const response = await apiClient.get<ApiResponse<Board[]>>(`/workspaces/${workspaceId}/boards`);
    return response.data.data!;
  },

  getStarredBoards: async (): Promise<Board[]> => {
    const response = await apiClient.get<ApiResponse<Board[]>>('/boards/starred');
    return response.data.data!;
  },

  getBoardById: async (id: string): Promise<Board> => {
    const response = await apiClient.get<ApiResponse<Board>>(`/boards/${id}`);
    return response.data.data!;
  },

  createBoard: async (workspaceId: string, data: { title: string }): Promise<Board> => {
    const response = await apiClient.post<ApiResponse<Board>>(`/workspaces/${workspaceId}/boards`, { ...data, workspaceId });
    return response.data.data!;
  },

  updateBoard: async (id: string, data: { title?: string; isPublic?: boolean }): Promise<Board> => {
    const response = await apiClient.patch<ApiResponse<Board>>(`/boards/${id}`, data);
    return response.data.data!;
  },

  deleteBoard: async (id: string): Promise<void> => {
    await apiClient.delete(`/boards/${id}`);
  },

  toggleStar: async (id: string): Promise<Board> => {
    const response = await apiClient.post<ApiResponse<Board>>(`/boards/${id}/star`);
    return response.data.data!;
  },
};
