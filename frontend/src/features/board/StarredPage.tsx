import React, { useEffect } from 'react';
import { EmptyState } from '@components/ui';
import { useBoardStore } from '@store/boardStore';
import { Star } from 'lucide-react';
import { BoardCard } from './components/BoardCard';

export const StarredPage: React.FC = () => {
  const { starredBoards, isFetching, fetchStarredBoards } = useBoardStore();

  useEffect(() => {
    fetchStarredBoards();
  }, [fetchStarredBoards]);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500 fill-current" />
            Starred Boards
          </h1>
          <p className="text-surface-500 mt-1">
            Quick access to your most important boards across all workspaces.
          </p>
        </div>
      </div>

      {isFetching ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-56 bg-surface-100 dark:bg-surface-800 rounded-xl" />
          ))}
        </div>
      ) : starredBoards.length === 0 ? (
        <EmptyState
          title="No starred boards"
          description="Star a board from any workspace to see it here."
          icon={<Star className="w-8 h-8 text-surface-400" />}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {starredBoards.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </div>
      )}
    </div>
  );
};
