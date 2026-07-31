export type ShapeType = 'pen' | 'rectangle' | 'ellipse' | 'line' | 'text' | 'sticky' | 'image';

export interface CanvasShape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  text?: string;
  src?: string;
  points?: number[];
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
}

export type ToolType = 'select' | 'hand' | ShapeType;
