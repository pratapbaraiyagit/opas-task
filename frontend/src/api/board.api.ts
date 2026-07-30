import { apiClient } from './client';
import { Board, ApiResponse } from '../types';

export const boardApi = {
  getWorkspaceBoards: async (workspaceId: string, search?: string): Promise<Board[]> => {
    const params = search ? { search } : undefined;
    const response = await apiClient.get<ApiResponse<Board[]>>(`/workspaces/${workspaceId}/boards`, { params });
    return response.data.data!;
  },

  getStarredBoards: async (search?: string): Promise<Board[]> => {
    const params = search ? { search } : undefined;
    const response = await apiClient.get<ApiResponse<Board[]>>('/boards/starred', { params });
    return response.data.data!;
  },

  getRecentBoards: async (): Promise<Board[]> => {
    const response = await apiClient.get<ApiResponse<Board[]>>('/boards/recent');
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

  saveVersion: async (boardId: string, versionName: string, shapes: any[]): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(`/boards/${boardId}/versions`, { versionName, shapes });
    return response.data.data;
  },

  getVersions: async (boardId: string): Promise<any[]> => {
    const response = await apiClient.get<ApiResponse<any[]>>(`/boards/${boardId}/versions`);
    return response.data.data!;
  },

  restoreVersion: async (boardId: string, versionId: string): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(`/boards/${boardId}/versions/${versionId}/restore`);
    return response.data.data;
  },

  toggleStar: async (id: string): Promise<Board> => {
    const response = await apiClient.post<ApiResponse<Board>>(`/boards/${id}/star`);
    return response.data.data!;
  },
};
