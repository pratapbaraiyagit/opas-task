import React, { useEffect, useState } from 'react';
import { EmptyState, Button } from '@components/ui';
import { useWorkspaceStore } from '@store/workspaceStore';
import { useBoardStore } from '@store/boardStore';
import { Plus, LayoutGrid } from 'lucide-react';
import { BoardCard } from '../board/components/BoardCard';
import { CreateBoardModal } from '../board/components/CreateBoardModal';

import { useSearchParams } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { activeWorkspace, isFetching: isWorkspaceFetching } = useWorkspaceStore();
  const { boards, recentBoards, isFetching: isBoardsFetching, fetchWorkspaceBoards, fetchRecentBoards } = useBoardStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';

  useEffect(() => {
    if (activeWorkspace) {
      fetchWorkspaceBoards(activeWorkspace.id, search);
    }
  }, [activeWorkspace, fetchWorkspaceBoards, search]);

  useEffect(() => {
    fetchRecentBoards();
  }, [fetchRecentBoards]);

  if (isWorkspaceFetching) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-surface-500">Loading workspace...</p>
      </div>
    );
  }

  if (!activeWorkspace) {
    return (
      <EmptyState
        title="No workspace selected"
        description="Select or create a workspace from the sidebar to get started."
        icon={<div className="w-12 h-12 bg-surface-100 dark:bg-surface-800 rounded-xl" />}
      />
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            {activeWorkspace.name}
          </h1>
          <p className="text-surface-500 mt-1">
            {activeWorkspace.description || 'Welcome to your workspace.'}
          </p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
          New Board
        </Button>
      </div>

      {recentBoards.length > 0 && !search && (
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
            Recently Viewed
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recentBoards.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
          All Workspace Boards
        </h2>
        {isBoardsFetching ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-56 bg-surface-100 dark:bg-surface-800 rounded-xl" />
            ))}
          </div>
      ) : boards.length === 0 ? (
        <EmptyState
          title="No boards yet"
          description="Create your first board to start collaborating."
          icon={<LayoutGrid className="w-8 h-8 text-surface-400" />}
          actionLabel="Create Board"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </div>
      )}
      </div>

      <CreateBoardModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
