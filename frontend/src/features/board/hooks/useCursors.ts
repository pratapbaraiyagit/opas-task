import { useState, useEffect } from 'react';
import { getSocket } from '../../../api/socket';

export interface Cursor {
  userId: string;
  userName: string;
  x: number;
  y: number;
  color: string;
  lastUpdate: number;
}

const CURSOR_TIMEOUT = 5000; // Remove cursor if no update for 5 seconds

// Stable set of colors to assign to users based on their ID
const CURSOR_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', 
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'
];

const getColorForString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
};

export const useCursors = (boardId: string) => {
  const [cursors, setCursors] = useState<Record<string, Cursor>>({});

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleCursorMove = (data: { userId: string; userName: string; x: number; y: number }) => {
      setCursors(prev => ({
        ...prev,
        [data.userId]: {
          ...data,
          color: getColorForString(data.userId),
          lastUpdate: Date.now()
        }
      }));
    };

    socket.on('cursor:move', handleCursorMove);

    // Cleanup stale cursors
    const interval = setInterval(() => {
      const now = Date.now();
      setCursors(prev => {
        const next = { ...prev };
        let changed = false;
        
        Object.keys(next).forEach(userId => {
          if (now - next[userId].lastUpdate > CURSOR_TIMEOUT) {
            delete next[userId];
            changed = true;
          }
        });
        
        return changed ? next : prev;
      });
    }, 1000);

    return () => {
      socket.off('cursor:move', handleCursorMove);
      clearInterval(interval);
    };
  }, [boardId]);

  return cursors;
};
