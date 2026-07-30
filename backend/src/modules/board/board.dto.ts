export interface CreateBoardDto {
  title: string;
  workspaceId: string;
}

export interface UpdateBoardDto {
  title?: string;
  isPublic?: boolean;
  publicRole?: 'VIEWER' | 'EDITOR';
  publicExpiresAt?: Date;
}
