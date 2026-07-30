import { Types } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role?: string;
        isAnonymous?: boolean;
      };
      workspaceRole?: 'owner' | 'editor' | 'viewer';
    }
  }
}

export interface JwtAccessPayload {
  id: string;
  email: string;
  name: string;
  isAnonymous?: boolean;
}

export interface JwtRefreshPayload {
  id: string;
  tokenVersion: number;
}

export interface JwtSharePayload {
  boardId: string;
  type: 'view';
  exp: number;
}

export interface PopulatedUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  verified: boolean;
}
