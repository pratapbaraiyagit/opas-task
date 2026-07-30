import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBoardStore } from '../../../store/boardStore';
import { useCanvasStore } from '../../../store/canvasStore';
import { CanvasHeader } from './CanvasHeader';
import { CanvasToolbar } from './CanvasToolbar';
import { BoardCanvas } from './BoardCanvas';
import { MeetingNotes } from './MeetingNotes';
import { CursorsLayer } from './components/CursorsLayer';
import { Spinner } from '@components/ui';
import { initSocket, disconnectSocket } from '../../../api/socket';

export const CanvasPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { fetchBoardById, activeBoard, isFetching } = useBoardStore();
  const { setBoardId, receiveAddShape, receiveUpdateShape, receiveDeleteShapes, clearCanvas } = useCanvasStore();
  const [error, setError] = useState<string | null>(null);
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  useEffect(() => {
    let socketInstance: any = null;

    if (id) {
      setBoardId(id);
      fetchBoardById(id).then(async (board) => {
        let token = localStorage.getItem('accessToken');
        
        if (!token && board?.isPublic) {
          try {
            const { default: api } = await import('../../../api/client');
            const res = await api.post('/auth/anonymous');
            token = res.data.data.accessToken as string;
            localStorage.setItem('accessToken', token);
          } catch (err) {
            console.error('Failed to get anonymous token', err);
          }
        }
        
        if (token) {
          socketInstance = initSocket(token);
          
          socketInstance.emit('join_board', id);

          socketInstance.on('shape:add', receiveAddShape);
          socketInstance.on('shape:update', ({ shapeId, attrs }: any) => receiveUpdateShape(shapeId, attrs));
          socketInstance.on('shape:delete', receiveDeleteShapes);
        }
      }).catch(err => {
        setError(err.response?.data?.message || 'Failed to load board');
      });
      
      return () => {
        if (socketInstance) {
          socketInstance.emit('leave_board', id);
          socketInstance.off('shape:add', receiveAddShape);
          socketInstance.off('shape:update');
          socketInstance.off('shape:delete', receiveDeleteShapes);
          disconnectSocket();
        }
        setBoardId(null);
        clearCanvas();
      };
    }
  }, [id, fetchBoardById, setBoardId, receiveAddShape, receiveUpdateShape, receiveDeleteShapes, clearCanvas]);

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
    <div className="relative w-full h-screen overflow-hidden bg-surface-50 dark:bg-surface-950 flex">
      <div className="relative flex-1 h-full">
        <CanvasHeader 
          board={activeBoard} 
          onToggleNotes={() => setIsNotesOpen(!isNotesOpen)} 
          onUpdateBoard={(board) => useBoardStore.getState().setActiveBoard(board)}
        />
        <CanvasToolbar />
        <CursorsLayer boardId={activeBoard.id} />
        <BoardCanvas />
      </div>
      
      <MeetingNotes 
        boardId={activeBoard.id} 
        isOpen={isNotesOpen} 
        onClose={() => setIsNotesOpen(false)} 
      />
    </div>
  );
};
