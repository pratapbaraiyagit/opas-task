import React from 'react';
import { useCursors } from '../../hooks/useCursors';
import { useCanvasStore } from '../../../../store/canvasStore';
import { MousePointer2 } from 'lucide-react';

interface CursorsLayerProps {
  boardId: string;
}

export const CursorsLayer: React.FC<CursorsLayerProps> = ({ boardId }) => {
  const cursors = useCursors(boardId);
  const { camera } = useCanvasStore();

  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
      {Object.values(cursors).map(cursor => {
        // Project canvas coordinates to screen coordinates
        const screenX = cursor.x * camera.scale + camera.x;
        const screenY = cursor.y * camera.scale + camera.y;

        return (
          <div
            key={cursor.userId}
            className="absolute top-0 left-0 transition-transform duration-100 ease-linear"
            style={{
              transform: `translate(${screenX}px, ${screenY}px)`,
            }}
          >
            <MousePointer2 
              className="w-5 h-5 drop-shadow-md" 
              style={{ color: cursor.color, fill: cursor.color }}
            />
            <div 
              className="mt-1 px-2 py-0.5 rounded text-white text-xs whitespace-nowrap shadow-md inline-block font-medium"
              style={{ backgroundColor: cursor.color }}
            >
              {cursor.userName}
            </div>
          </div>
        );
      })}
    </div>
  );
};
