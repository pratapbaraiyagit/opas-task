import { create } from 'zustand';
import { Board } from '../types';
import { boardApi } from '@api/board.api';
import toast from 'react-hot-toast';

interface BoardState {
  boards: Board[];
  starredBoards: Board[];
  recentBoards: Board[];
  activeBoard: Board | null;
  isLoading: boolean;
  isFetching: boolean;

  fetchWorkspaceBoards: (workspaceId: string, search?: string) => Promise<void>;
  fetchStarredBoards: (search?: string) => Promise<void>;
  fetchRecentBoards: () => Promise<void>;
  fetchBoardById: (id: string) => Promise<Board>;
  createBoard: (workspaceId: string, data: { title: string }) => Promise<Board>;
  updateBoard: (id: string, data: { title?: string; isPublic?: boolean }) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
  toggleStar: (id: string) => Promise<void>;
  setActiveBoard: (board: Board | null) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  boards: [],
  starredBoards: [],
  recentBoards: [],
  activeBoard: null,
  isLoading: false,
  isFetching: false,

  fetchWorkspaceBoards: async (workspaceId: string, search?: string) => {
    set({ isFetching: true });
    try {
      const boards = await boardApi.getWorkspaceBoards(workspaceId, search);
      set({ boards });
    } catch (error: any) {
      toast.error('Failed to load boards');
    } finally {
      set({ isFetching: false });
    }
  },

  fetchStarredBoards: async (search?: string) => {
    set({ isFetching: true });
    try {
      const starredBoards = await boardApi.getStarredBoards(search);
      set({ starredBoards });
    } catch (error: any) {
      toast.error('Failed to load starred boards');
    } finally {
      set({ isFetching: false });
    }
  },

  fetchRecentBoards: async () => {
    set({ isFetching: true });
    try {
      const recentBoards = await boardApi.getRecentBoards();
      set({ recentBoards });
    } catch (error: any) {
      toast.error('Failed to load recent boards');
    } finally {
      set({ isFetching: false });
    }
  },

  fetchBoardById: async (id: string) => {
    set({ isFetching: true });
    try {
      const activeBoard = await boardApi.getBoardById(id);
      set({ activeBoard });
      return activeBoard;
    } catch (error: any) {
      toast.error('Failed to load board');
      throw error;
    } finally {
      set({ isFetching: false });
    }
  },

  createBoard: async (workspaceId, data) => {
    set({ isLoading: true });
    try {
      const newBoard = await boardApi.createBoard(workspaceId, data);
      set((state) => ({ boards: [newBoard, ...state.boards] }));
      toast.success('Board created successfully');
      return newBoard;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create board');
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateBoard: async (id, data) => {
    set({ isLoading: true });
    try {
      const updated = await boardApi.updateBoard(id, data);
      set((state) => ({
        boards: state.boards.map((b) => (b.id === id ? updated : b)),
        activeBoard: state.activeBoard?.id === id ? updated : state.activeBoard,
        starredBoards: state.starredBoards.map((b) => (b.id === id ? updated : b)),
      }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update board');
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteBoard: async (id) => {
    set({ isLoading: true });
    try {
      await boardApi.deleteBoard(id);
      set((state) => ({
        boards: state.boards.filter((b) => b.id !== id),
        starredBoards: state.starredBoards.filter((b) => b.id !== id),
        activeBoard: state.activeBoard?.id === id ? null : state.activeBoard,
      }));
      toast.success('Board deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete board');
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  toggleStar: async (id) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) return;

      const updateBoardInList = (boards: Board[], isStarred: boolean) =>
        boards.map((b) => {
          if (b.id !== id) return b;
          const starredBy = isStarred
            ? b.starredBy.filter((uid) => uid !== user.id)
            : [...(b.starredBy || []), user.id];
          return { ...b, starredBy };
        });

      set((state) => {
        const existingBoard =
          state.boards.find((b) => b.id === id) ??
          state.recentBoards.find((b) => b.id === id) ??
          state.starredBoards.find((b) => b.id === id);
        const isStarred = existingBoard?.starredBy?.includes(user.id) ?? false;

        return {
          boards: updateBoardInList(state.boards, isStarred),
          recentBoards: updateBoardInList(state.recentBoards, isStarred),
          starredBoards: updateBoardInList(state.starredBoards, isStarred),
          activeBoard:
            state.activeBoard?.id === id
              ? updateBoardInList([state.activeBoard], isStarred)[0]
              : state.activeBoard,
        };
      });

      const updated = await boardApi.toggleStar(id);

      set((state) => {
        const isNowStarred = updated.starredBy?.includes(user.id);
        const newStarredBoards = isNowStarred
          ? [...state.starredBoards.filter((b) => b.id !== id), updated]
          : state.starredBoards.filter((b) => b.id !== id);

        return {
          boards: state.boards.map((b) => (b.id === id ? updated : b)),
          recentBoards: state.recentBoards.map((b) => (b.id === id ? updated : b)),
          activeBoard: state.activeBoard?.id === id ? updated : state.activeBoard,
          starredBoards: newStarredBoards,
        };
      });
    } catch (error: any) {
      toast.error('Failed to update star');
    }
  },

  setActiveBoard: (board) => {
    set({ activeBoard: board });
  },
}));

// We need to import useAuthStore for optimistic star toggle
import { useAuthStore } from './authStore';
