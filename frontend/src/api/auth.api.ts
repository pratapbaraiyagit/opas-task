import { apiClient } from './client';
import { User, ApiResponse } from '../types';

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export const authApi = {
  signup: async (data: any): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/signup', data);
    return response.data.data!;
  },

  login: async (data: any): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data.data!;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data!;
  },

  forgotPassword: async (data: { email: string }): Promise<void> => {
    await apiClient.post('/auth/forgot-password', data);
  },

  resetPassword: async (data: any): Promise<void> => {
    await apiClient.post('/auth/reset-password', data);
  },

  verifyEmail: async (token: string): Promise<void> => {
    await apiClient.get(`/auth/verify-email/${token}`);
  },
};
