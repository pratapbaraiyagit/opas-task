export type Role = 'owner' | 'editor' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  verified: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  owner: string;
  members: WorkspaceMember[];
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  userId: string;
  user?: User;
  role: Role;
  joinedAt: string;
}

export interface Board {
  id: string;
  workspaceId: string;
  title: string;
  starredBy: string[];
  lastOpenedAt: Record<string, string>;
  thumbnail?: string;
  createdBy: User;
  isPublic: boolean;
  publicRole: 'VIEWER' | 'EDITOR';
  publicExpiresAt?: string | null;
  shapes?: CanvasObject[];
  canEdit?: boolean;
  canView?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CanvasObject {
  id: string;
  type: 'pen' | 'rectangle' | 'circle' | 'arrow' | 'sticky' | 'text';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  points?: number[];
  text?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  fontSize?: number;
  fontFamily?: string;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  opacity?: number;
  draggable?: boolean;
  visible?: boolean;
  zIndex?: number;
}

export interface CursorPosition {
  x: number;
  y: number;
  userId: string;
  userName: string;
  color: string;
}

export interface Presence {
  userId: string;
  userName: string;
  color: string;
  cursor?: CursorPosition;
  isTyping?: boolean;
  lastSeen: string;
}

export interface VersionSnapshot {
  id: string;
  boardId: string;
  canvasState: CanvasObject[];
  notesState: string;
  createdBy: User;
  createdAt: string;
  label?: string;
}

export interface ActionItem {
  title: string;
  owner: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PublicShareLink {
  id: string;
  boardId: string;
  token: string;
  expiresAt: string;
  viewOnly: boolean;
  createdAt: string;
}
