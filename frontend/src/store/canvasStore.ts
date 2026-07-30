import { create } from 'zustand';
import { CanvasShape, ToolType } from '../types/canvas';
import { getSocket } from '../api/socket';

interface Camera {
  x: number;
  y: number;
  scale: number;
}

interface CanvasState {
  boardId: string | null;
  shapes: CanvasShape[];
  selectedShapeIds: string[];
  tool: ToolType;
  camera: Camera;
  
  // Actions
  setBoardId: (id: string | null) => void;
  setTool: (tool: ToolType) => void;
  setCamera: (camera: Camera) => void;
  
  // Local Actions (Emit to Socket)
  addShape: (shape: CanvasShape) => void;
  updateShape: (id: string, attrs: Partial<CanvasShape>) => void;
  deleteShapes: (ids: string[]) => void;
  
  // Remote Actions (From Socket)
  receiveAddShape: (shape: CanvasShape) => void;
  receiveUpdateShape: (id: string, attrs: Partial<CanvasShape>) => void;
  receiveDeleteShapes: (ids: string[]) => void;

  selectShapes: (ids: string[]) => void;
  clearSelection: () => void;
  clearCanvas: () => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  boardId: null,
  shapes: [],
  selectedShapeIds: [],
  tool: 'select',
  camera: { x: 0, y: 0, scale: 1 },

  setBoardId: (id) => set({ boardId: id }),
  setTool: (tool) => set({ tool }),
  setCamera: (camera) => set({ camera }),

  addShape: (shape) => {
    const { boardId } = get();
    const socket = getSocket();
    if (socket && boardId) {
      socket.emit('shape:add', { boardId, shape });
    }
    set((state) => ({ 
      shapes: [...state.shapes, shape],
      selectedShapeIds: state.tool === 'select' ? [shape.id] : [] 
    }));
  },

  updateShape: (id, attrs) => {
    const { boardId } = get();
    const socket = getSocket();
    if (socket && boardId) {
      socket.emit('shape:update', { boardId, shapeId: id, attrs });
    }
    set((state) => ({
      shapes: state.shapes.map((s) => (s.id === id ? { ...s, ...attrs } : s))
    }));
  },

  deleteShapes: (ids) => {
    const { boardId } = get();
    const socket = getSocket();
    if (socket && boardId) {
      socket.emit('shape:delete', { boardId, shapeIds: ids });
    }
    set((state) => ({
      shapes: state.shapes.filter((s) => !ids.includes(s.id)),
      selectedShapeIds: state.selectedShapeIds.filter((id) => !ids.includes(id))
    }));
  },

  receiveAddShape: (shape) => set((state) => {
    // Avoid duplicates
    if (state.shapes.find(s => s.id === shape.id)) return state;
    return { shapes: [...state.shapes, shape] };
  }),

  receiveUpdateShape: (id, attrs) => set((state) => ({
    shapes: state.shapes.map((s) => (s.id === id ? { ...s, ...attrs } : s))
  })),

  receiveDeleteShapes: (ids) => set((state) => ({
    shapes: state.shapes.filter((s) => !ids.includes(s.id)),
    selectedShapeIds: state.selectedShapeIds.filter((id) => !ids.includes(id))
  })),

  selectShapes: (ids) => set({ selectedShapeIds: ids }),
  clearSelection: () => set({ selectedShapeIds: [] }),
  clearCanvas: () => set({ shapes: [], selectedShapeIds: [] }),
}));
