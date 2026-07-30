import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBoardStore } from '../../../store/boardStore';
import { CanvasHeader } from './CanvasHeader';
import { CanvasToolbar } from './CanvasToolbar';
import { BoardCanvas } from './BoardCanvas';
import { Spinner } from '@components/ui';

export const CanvasPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { fetchBoardById, activeBoard, isFetching } = useBoardStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchBoardById(id).catch(err => {
        setError(err.response?.data?.message || 'Failed to load board');
      });
    }
  }, [id, fetchBoardById]);

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-surface-50 dark:bg-surface-950 h-screen">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-surface-900 dark:text-white">Access Denied</h2>
          <p className="text-surface-500">{error}</p>
        </div>
      </div>
    );
  }

  if (isFetching || !activeBoard) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface-50 dark:bg-surface-950 h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-surface-50 dark:bg-surface-950">
      <CanvasHeader board={activeBoard} />
      <CanvasToolbar />
      <BoardCanvas />
    </div>
  );
};
