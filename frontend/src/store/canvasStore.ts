import { create } from 'zustand';
import { CanvasShape, ToolType } from '../types/canvas';

interface Camera {
  x: number;
  y: number;
  scale: number;
}

interface CanvasState {
  shapes: CanvasShape[];
  selectedShapeIds: string[];
  tool: ToolType;
  camera: Camera;
  
  // Actions
  setTool: (tool: ToolType) => void;
  setCamera: (camera: Camera) => void;
  addShape: (shape: CanvasShape) => void;
  updateShape: (id: string, attrs: Partial<CanvasShape>) => void;
  deleteShapes: (ids: string[]) => void;
  selectShapes: (ids: string[]) => void;
  clearSelection: () => void;
  clearCanvas: () => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  shapes: [],
  selectedShapeIds: [],
  tool: 'select',
  camera: { x: 0, y: 0, scale: 1 },

  setTool: (tool) => set({ tool }),
  
  setCamera: (camera) => set({ camera }),

  addShape: (shape) => set((state) => ({ 
    shapes: [...state.shapes, shape],
    selectedShapeIds: state.tool === 'select' ? [shape.id] : [] 
  })),

  updateShape: (id, attrs) => set((state) => ({
    shapes: state.shapes.map((s) => (s.id === id ? { ...s, ...attrs } : s))
  })),

  deleteShapes: (ids) => set((state) => ({
    shapes: state.shapes.filter((s) => !ids.includes(s.id)),
    selectedShapeIds: state.selectedShapeIds.filter((id) => !ids.includes(id))
  })),

  selectShapes: (ids) => set({ selectedShapeIds: ids }),
  
  clearSelection: () => set({ selectedShapeIds: [] }),
  
  clearCanvas: () => set({ shapes: [], selectedShapeIds: [] }),
}));
