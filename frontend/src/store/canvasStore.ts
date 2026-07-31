import { create } from 'zustand';
import { CanvasShape, ToolType } from '../types/canvas';
import { getSocket } from '../api/socket';
import { saveBoardShapes } from '../utils/indexedDB';

interface Camera {
  x: number;
  y: number;
  scale: number;
}

export type HistoryAction = 
  | { type: 'ADD', shape: CanvasShape }
  | { type: 'UPDATE', shapeId: string, oldAttrs: Partial<CanvasShape>, newAttrs: Partial<CanvasShape> }
  | { type: 'DELETE', shapes: CanvasShape[] };

interface CanvasState {
  boardId: string | null;
  shapes: CanvasShape[];
  selectedShapeIds: string[];
  tool: ToolType;
  camera: Camera;
  readOnly: boolean;
  
  past: HistoryAction[];
  future: HistoryAction[];
  
  setBoardId: (id: string | null) => void;
  setReadOnly: (readOnly: boolean) => void;
  loadShapes: (shapes: CanvasShape[]) => void;
  setTool: (tool: ToolType) => void;
  setCamera: (camera: Camera) => void;
  
  addShape: (shape: CanvasShape) => void;
  updateShape: (id: string, attrs: Partial<CanvasShape>) => void;
  deleteShapes: (ids: string[]) => void;
  
  undo: () => void;
  redo: () => void;
  
  receiveAddShape: (shape: CanvasShape) => void;
  receiveUpdateShape: (id: string, attrs: Partial<CanvasShape>) => void;
  receiveDeleteShapes: (ids: string[]) => void;
  receiveRestoredShapes: (shapes: CanvasShape[]) => void;

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
  readOnly: false,
  past: [],
  future: [],

  setBoardId: (id) => {
    set({ boardId: id });
  },

  setReadOnly: (readOnly) => {
    set({ readOnly, tool: readOnly ? 'hand' : 'select' });
  },

  loadShapes: (shapes) => {
    set({
      shapes: shapes as CanvasShape[],
      past: [],
      future: [],
      selectedShapeIds: [],
    });
  },
  
  setTool: (tool) => {
    if (get().readOnly && tool !== 'hand') return;
    set({ tool });
  },
  setCamera: (camera) => set({ camera }),

  addShape: (shape) => {
    if (get().readOnly) return;
    const { boardId, past } = get();
    const socket = getSocket();
    if (socket && boardId) {
      socket.emit('shape:add', { boardId, shape });
    }
    set((state) => ({ 
      shapes: [...state.shapes, shape],
      selectedShapeIds: state.tool === 'select' ? [shape.id] : [],
      past: [...past, { type: 'ADD', shape }],
      future: []
    }));
  },

  updateShape: (id, attrs) => {
    if (get().readOnly) return;
    const { boardId, shapes, past } = get();
    const oldShape = shapes.find(s => s.id === id);
    if (!oldShape) return;

    const oldAttrs: Partial<CanvasShape> = {};
    Object.keys(attrs).forEach(key => {
      (oldAttrs as any)[key] = (oldShape as any)[key];
    });

    const socket = getSocket();
    if (socket && boardId) {
      socket.emit('shape:update', { boardId, shapeId: id, attrs });
    }
    set((state) => ({
      shapes: state.shapes.map((s) => (s.id === id ? { ...s, ...attrs } : s)),
      past: [...past, { type: 'UPDATE', shapeId: id, oldAttrs, newAttrs: attrs }],
      future: []
    }));
  },

  deleteShapes: (ids) => {
    if (get().readOnly) return;
    const { boardId, shapes, past } = get();
    const deletedShapes = shapes.filter(s => ids.includes(s.id));
    
    const socket = getSocket();
    if (socket && boardId) {
      socket.emit('shape:delete', { boardId, shapeIds: ids });
    }
    set((state) => ({
      shapes: state.shapes.filter((s) => !ids.includes(s.id)),
      selectedShapeIds: state.selectedShapeIds.filter((id) => !ids.includes(id)),
      past: [...past, { type: 'DELETE', shapes: deletedShapes }],
      future: []
    }));
  },

  undo: () => {
    if (get().readOnly) return;
    const { past, future, boardId, shapes } = get();
    if (past.length === 0) return;
    
    const action = past[past.length - 1];
    const newPast = past.slice(0, -1);
    
    const socket = getSocket();
    
    if (action.type === 'ADD') {
      if (socket && boardId) socket.emit('shape:delete', { boardId, shapeIds: [action.shape.id] });
      set({ 
        shapes: shapes.filter(s => s.id !== action.shape.id),
        past: newPast,
        future: [...future, action]
      });
    } else if (action.type === 'UPDATE') {
      if (socket && boardId) socket.emit('shape:update', { boardId, shapeId: action.shapeId, attrs: action.oldAttrs });
      set({
        shapes: shapes.map(s => s.id === action.shapeId ? { ...s, ...action.oldAttrs } : s),
        past: newPast,
        future: [...future, action]
      });
    } else if (action.type === 'DELETE') {
      action.shapes.forEach(shape => {
        if (socket && boardId) socket.emit('shape:add', { boardId, shape });
      });
      set({
        shapes: [...shapes, ...action.shapes],
        past: newPast,
        future: [...future, action]
      });
    }
  },

  redo: () => {
    if (get().readOnly) return;
    const { past, future, boardId, shapes } = get();
    if (future.length === 0) return;
    
    const action = future[future.length - 1];
    const newFuture = future.slice(0, -1);
    
    const socket = getSocket();
    
    if (action.type === 'ADD') {
      if (socket && boardId) socket.emit('shape:add', { boardId, shape: action.shape });
      set({
        shapes: [...shapes, action.shape],
        past: [...past, action],
        future: newFuture
      });
    } else if (action.type === 'UPDATE') {
      if (socket && boardId) socket.emit('shape:update', { boardId, shapeId: action.shapeId, attrs: action.newAttrs });
      set({
        shapes: shapes.map(s => s.id === action.shapeId ? { ...s, ...action.newAttrs } : s),
        past: [...past, action],
        future: newFuture
      });
    } else if (action.type === 'DELETE') {
      const ids = action.shapes.map(s => s.id);
      if (socket && boardId) socket.emit('shape:delete', { boardId, shapeIds: ids });
      set({
        shapes: shapes.filter(s => !ids.includes(s.id)),
        past: [...past, action],
        future: newFuture
      });
    }
  },

  receiveAddShape: (shape) => set((state) => {
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

  receiveRestoredShapes: (shapes) => set({
    shapes,
    past: [],
    future: [],
    selectedShapeIds: []
  }),

  selectShapes: (ids) => set({ selectedShapeIds: ids }),
  clearSelection: () => set({ selectedShapeIds: [] }),
  clearCanvas: () => set({ shapes: [], selectedShapeIds: [], past: [], future: [], readOnly: false }),
}));

useCanvasStore.subscribe((state, prevState) => {
  if (state.boardId && state.shapes !== prevState.shapes) {
    saveBoardShapes(state.boardId, state.shapes);
  }
});
