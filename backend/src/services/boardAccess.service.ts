import { BoardRepository } from '@modules/board/board.repository';
import { WorkspaceRepository } from '@modules/workspace/workspace.repository';
import { Role } from '../types/common';

export interface BoardAccess {
  canView: boolean;
  canEdit: boolean;
}

const boardRepository = new BoardRepository();
const workspaceRepository = new WorkspaceRepository();

const roleCanEdit = (role: Role): boolean => role === 'owner' || role === 'editor';

export const getBoardAccess = async (
  userId: string,
  isAnonymous: boolean,
  boardId: string,
): Promise<BoardAccess | null> => {
  const board = await boardRepository.findById(boardId);
  if (!board) {
    return null;
  }

  if (!isAnonymous) {
    const workspace = await workspaceRepository.findById(board.workspaceId.toString());
    const member = workspace?.members.find((m) => m.user._id.toString() === userId);

    if (member) {
      return {
        canView: true,
        canEdit: roleCanEdit(member.role),
      };
    }
  }

  if (board.isPublic) {
    const isExpired =
      board.publicExpiresAt && new Date(board.publicExpiresAt).getTime() < Date.now();

    if (!isExpired) {
      return {
        canView: true,
        canEdit: board.publicRole === 'EDITOR',
      };
    }
  }

  return null;
};
