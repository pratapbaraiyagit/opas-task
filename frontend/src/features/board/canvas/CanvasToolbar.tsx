import React from 'react';
import { 
  MousePointer2, 
  Hand, 
  Square, 
  Circle, 
  Minus, 
  Type, 
  StickyNote,
  Undo,
  Redo
} from 'lucide-react';
import { useCanvasStore } from '../../../store/canvasStore';
import { ToolType } from '../../../types/canvas';
import { cn } from '@utils/index';

const tools: { type: ToolType; icon: React.ElementType; label: string }[] = [
  { type: 'select', icon: MousePointer2, label: 'Select (V)' },
  { type: 'hand', icon: Hand, label: 'Pan (H)' },
  { type: 'rectangle', icon: Square, label: 'Rectangle (R)' },
  { type: 'ellipse', icon: Circle, label: 'Ellipse (O)' },
  { type: 'line', icon: Minus, label: 'Line (L)' },
  { type: 'text', icon: Type, label: 'Text (T)' },
  { type: 'sticky', icon: StickyNote, label: 'Sticky Note (N)' },
];

export const CanvasToolbar: React.FC = () => {
  const { tool, setTool } = useCanvasStore();

  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 glass-card p-1.5 flex flex-col gap-1 z-40 rounded-xl shadow-lg border border-surface-200 dark:border-surface-800 bg-white/90 dark:bg-surface-900/90 backdrop-blur-md">
      {tools.map(({ type, icon: Icon, label }) => (
        <button
          key={type}
          onClick={() => setTool(type)}
          title={label}
          className={cn(
            'p-2.5 rounded-lg transition-colors group relative flex items-center justify-center',
            tool === type 
              ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
              : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
          )}
        >
          <Icon className="w-5 h-5" />
        </button>
      ))}
      <div className="h-px bg-surface-200 dark:bg-surface-800 my-1 mx-2" />
      <button
        onClick={() => useCanvasStore.getState().undo()}
        title="Undo (Cmd+Z)"
        disabled={useCanvasStore((state) => state.past.length === 0)}
        className="p-2.5 rounded-lg transition-colors group relative flex items-center justify-center text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Undo className="w-5 h-5" />
      </button>
      <button
        onClick={() => useCanvasStore.getState().redo()}
        title="Redo (Cmd+Shift+Z)"
        disabled={useCanvasStore((state) => state.future.length === 0)}
        className="p-2.5 rounded-lg transition-colors group relative flex items-center justify-center text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Redo className="w-5 h-5" />
      </button>
    </div>
  );
};
