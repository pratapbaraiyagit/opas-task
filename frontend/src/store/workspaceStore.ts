import { create } from 'zustand';
import { Workspace } from '../types';
import { workspaceApi } from '@api/workspace.api';
import toast from 'react-hot-toast';

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  isLoading: boolean;
  isFetching: boolean;

  fetchWorkspaces: () => Promise<void>;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  createWorkspace: (data: { name: string; description?: string }) => Promise<void>;
  updateWorkspace: (id: string, data: { name?: string; description?: string }) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  activeWorkspace: null,
  isLoading: false,
  isFetching: false,

  fetchWorkspaces: async () => {
    set({ isFetching: true });
    try {
      const workspaces = await workspaceApi.getWorkspaces();
      set({ workspaces });

      // Auto-select first workspace if none active
      const { activeWorkspace } = get();
      if (!activeWorkspace && workspaces.length > 0) {
        set({ activeWorkspace: workspaces[0] });
      } else if (activeWorkspace) {
        // Update active workspace with latest data if it exists
        const updatedActive = workspaces.find((w) => w.id === activeWorkspace.id);
        if (updatedActive) {
          set({ activeWorkspace: updatedActive });
        } else {
          set({ activeWorkspace: workspaces.length > 0 ? workspaces[0] : null });
        }
      }
    } catch (error: any) {
      toast.error('Failed to load workspaces');
    } finally {
      set({ isFetching: false });
    }
  },

  setActiveWorkspace: (workspace) => {
    set({ activeWorkspace: workspace });
  },

  createWorkspace: async (data) => {
    set({ isLoading: true });
    try {
      const newWorkspace = await workspaceApi.createWorkspace(data);
      set((state) => ({
        workspaces: [newWorkspace, ...state.workspaces],
        activeWorkspace: newWorkspace,
      }));
      toast.success('Workspace created successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create workspace');
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateWorkspace: async (id, data) => {
    set({ isLoading: true });
    try {
      const updated = await workspaceApi.updateWorkspace(id, data);
      set((state) => ({
        workspaces: state.workspaces.map((w) => (w.id === id ? updated : w)),
        activeWorkspace: state.activeWorkspace?.id === id ? updated : state.activeWorkspace,
      }));
      toast.success('Workspace updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update workspace');
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteWorkspace: async (id) => {
    set({ isLoading: true });
    try {
      await workspaceApi.deleteWorkspace(id);
      set((state) => {
        const remaining = state.workspaces.filter((w) => w.id !== id);
        return {
          workspaces: remaining,
          activeWorkspace: state.activeWorkspace?.id === id ? (remaining.length > 0 ? remaining[0] : null) : state.activeWorkspace,
        };
      });
      toast.success('Workspace deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete workspace');
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
