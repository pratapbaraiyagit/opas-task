export type Role = 'owner' | 'editor' | 'viewer';

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchQuery extends PaginationQuery {
  search?: string;
}

export const ROLES = {
  OWNER: 'owner' as const,
  EDITOR: 'editor' as const,
  VIEWER: 'viewer' as const,
};

export const ROLE_HIERARCHY: Record<Role, number> = {
  owner: 3,
  editor: 2,
  viewer: 1,
};

export interface SocketUser {
  id: string;
  name: string;
  email: string;
  color: string;
}

export interface CursorPosition {
  x: number;
  y: number;
  userId: string;
  userName: string;
  color: string;
}
