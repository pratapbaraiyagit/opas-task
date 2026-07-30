import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MoreVertical, Clock, Trash2, Edit2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { Board } from '../../../types';
import { Dropdown } from '@components/ui';
import { useBoardStore } from '@store/boardStore';
import { useAuthStore } from '@store/authStore';
import { cn } from '@utils/index';
import { RenameBoardModal } from './RenameBoardModal';

interface BoardCardProps {
  board: Board;
}

export const BoardCard: React.FC<BoardCardProps> = ({ board }) => {
  const navigate = useNavigate();
  const { toggleStar, deleteBoard } = useBoardStore();
  const { user } = useAuthStore();
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);

  const isStarred = user && board.starredBy?.includes(user.id);
  const lastOpened = board.lastOpenedAt?.[user?.id || ''] 
    ? new Date(board.lastOpenedAt[user!.id]) 
    : new Date(board.updatedAt);

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleStar(board.id);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this board? This action cannot be undone.')) {
      await deleteBoard(board.id);
    }
  };

  return (
    <>
      <div
        className="group relative bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl hover:shadow-lg dark:hover:shadow-black/20 hover:border-primary-500/30 transition-all cursor-pointer flex flex-col h-56"
        onClick={() => navigate(`/board/${board.id}`)}
      >
        <div className="relative flex-1 bg-surface-100 dark:bg-surface-800/50 flex items-center justify-center p-4 rounded-t-xl overflow-hidden">
          {board.thumbnail ? (
            <img src={board.thumbnail} alt={board.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-surface-800 shadow-sm border border-surface-200 dark:border-surface-700 flex items-center justify-center opacity-50">
              <span className="text-2xl">📝</span>
            </div>
          )}

          <button
            onClick={handleStarClick}
            className={cn(
              'absolute top-3 right-3 p-2 rounded-lg backdrop-blur-md bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 transition-all',
              isStarred ? 'opacity-100 text-yellow-500' : 'opacity-0 group-hover:opacity-100 text-surface-500 hover:text-surface-900 dark:hover:text-white'
            )}
          >
            <Star className="w-4 h-4" fill={isStarred ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="p-4 bg-white dark:bg-surface-900 flex items-center justify-between border-t border-surface-100 dark:border-surface-800 rounded-b-xl">
          <div className="flex-1 truncate pr-4">
            <h3 className="font-medium text-surface-900 dark:text-white truncate">
              {board.title}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-surface-500">
              <Clock className="w-3 h-3" />
              <span>Opened {formatDistanceToNow(lastOpened, { addSuffix: true })}</span>
            </div>
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <Dropdown
              trigger={
                <button className="btn-icon opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4" />
                </button>
              }
              items={[
                { label: 'Rename', icon: <Edit2 className="w-4 h-4" />, onClick: () => setIsRenameModalOpen(true) },
                'divider',
                { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: handleDelete, danger: true },
              ]}
            />
          </div>
        </div>
      </div>
      
      <RenameBoardModal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        board={board}
      />
    </>
  );
};
