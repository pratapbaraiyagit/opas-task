import { create } from 'zustand';
import { User } from '../types';
import { authApi } from '@api/auth.api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  setUser: (user: User | null) => void;
  login: (data: any) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (data) => {
    set({ isLoading: true });
    try {
      const response = await authApi.login(data);
      localStorage.setItem('accessToken', response.accessToken);
      set({ user: response.user, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (data) => {
    set({ isLoading: true });
    try {
      await authApi.signup(data);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem('accessToken');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  checkAuth: async () => {
    if (get().isInitialized) return;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ isInitialized: true });
      return;
    }

    try {
      const user = await authApi.getMe();
      set({ user, isAuthenticated: true, isInitialized: true });
    } catch {
      localStorage.removeItem('accessToken');
      set({ user: null, isAuthenticated: false, isInitialized: true });
    }
  },
}));
