import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Share, FileText, Download } from 'lucide-react';
import { Board } from '../../../types';
import { Button } from '@components/ui';
import { ShareModal } from './components/ShareModal';

interface CanvasHeaderProps {
  board: Board;
  onToggleNotes: () => void;
  onUpdateBoard: (board: Board) => void;
}

export const CanvasHeader: React.FC<CanvasHeaderProps> = ({ board, onToggleNotes, onUpdateBoard }) => {
  const navigate = useNavigate();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <>
      <div className="absolute top-0 left-0 right-0 h-14 bg-white/80 dark:bg-surface-900/80 backdrop-blur-md border-b border-surface-200 dark:border-surface-800 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-surface-600 dark:text-surface-400" />
          </button>
          <div className="h-4 w-px bg-surface-300 dark:bg-surface-700" />
          <h1 className="font-semibold text-surface-900 dark:text-white">{board.title}</h1>
          {board.isPublic && (
            <span className="text-[10px] font-medium uppercase tracking-wider bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 px-2 py-0.5 rounded-full">
              Public
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-2 mr-2">
            {/* Future: Real-time user avatars */}
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-medium border-2 border-white dark:border-surface-900 z-10">
              Me
            </div>
          </div>
          <Button variant="secondary" className="gap-2" onClick={onToggleNotes}>
            <FileText className="w-4 h-4" />
            Notes
          </Button>
          <Button variant="secondary" className="gap-2" onClick={() => document.dispatchEvent(new CustomEvent('canvas:download'))}>
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button variant="primary" className="gap-2" onClick={() => setIsShareModalOpen(true)}>
            <Share className="w-4 h-4" />
            Share
          </Button>
        </div>
      </div>

      <ShareModal 
        board={board} 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        onUpdate={onUpdateBoard} 
      />
    </>
  );
};
