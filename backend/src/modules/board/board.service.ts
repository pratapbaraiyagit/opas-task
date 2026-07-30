import { ApiError } from '@utils/ApiError';
import { WorkspaceRepository } from '@modules/workspace/workspace.repository';
import { BoardRepository } from './board.repository';
import { CreateBoardDto, UpdateBoardDto } from './board.dto';
import { IBoard } from './board.model';
import { IBoardVersion } from './board-version.model';

export class BoardService {
  private boardRepository: BoardRepository;
  private workspaceRepository: WorkspaceRepository;

  constructor() {
    this.boardRepository = new BoardRepository();
    this.workspaceRepository = new WorkspaceRepository();
  }

  async createBoard(userId: string, data: CreateBoardDto): Promise<IBoard> {
    // We assume authorization is already handled by middleware ensuring user can create boards in this workspace.
    // However, just double check workspace exists.
    const workspace = await this.workspaceRepository.findById(data.workspaceId);
    if (!workspace) {
      throw ApiError.notFound('Workspace not found');
    }

    return this.boardRepository.create(userId, data);
  }

  async getWorkspaceBoards(workspaceId: string, search?: string): Promise<IBoard[]> {
    return this.boardRepository.findAllByWorkspace(workspaceId, search);
  }

  async getStarredBoards(userId: string, search?: string): Promise<IBoard[]> {
    return this.boardRepository.findAllStarredByUser(userId, search);
  }

  async getRecentBoards(userId: string): Promise<IBoard[]> {
    return this.boardRepository.findRecentBoards(userId);
  }

  async getBoardById(boardId: string, userId?: string): Promise<IBoard> {
    const board = await this.boardRepository.findById(boardId);
    if (!board) {
      throw ApiError.notFound('Board not found');
    }

    if (board.isPublic) {
      if (userId) {
        this.boardRepository.updateLastOpened(boardId, userId).catch(console.error);
      }
      return board;
    }

    if (!userId) {
      throw ApiError.forbidden('You do not have access to this board');
    }

    // Check if user has access via workspace
    const workspace = await this.workspaceRepository.findById(board.workspaceId.toString());
    const isMember = workspace?.members.some((m) => m.user._id.toString() === userId);

    if (!isMember) {
      throw ApiError.forbidden('You do not have access to this board');
    }

    this.boardRepository.updateLastOpened(boardId, userId).catch(console.error);
    return board;
  }

  async updateBoard(boardId: string, data: UpdateBoardDto): Promise<IBoard> {
    const board = await this.boardRepository.update(boardId, data);
    if (!board) {
      throw ApiError.notFound('Board not found');
    }
    return board;
  }

  async deleteBoard(boardId: string): Promise<void> {
    const board = await this.boardRepository.delete(boardId);
    if (!board) {
      throw ApiError.notFound('Board not found');
    }
  }

  async toggleStar(boardId: string, userId: string): Promise<IBoard> {
    const board = await this.boardRepository.findById(boardId);
    if (!board) {
      throw ApiError.notFound('Board not found');
    }

    const isStarred = board.starredBy.some((id) => id.toString() === userId);
    const updatedBoard = await this.boardRepository.toggleStar(boardId, userId, isStarred);
    
    if (!updatedBoard) {
       throw ApiError.notFound('Board not found');
    }
    
    return updatedBoard;
  }

  async saveVersion(boardId: string, userId: string, versionName: string, shapes: any[]): Promise<IBoardVersion> {
    const board = await this.boardRepository.findById(boardId);
    if (!board) {
      throw ApiError.notFound('Board not found');
    }
    // Access control: only EDITOR or owner/member
    return this.boardRepository.saveVersion(boardId, userId, versionName, shapes);
  }

  async getVersions(boardId: string): Promise<IBoardVersion[]> {
    return this.boardRepository.getVersions(boardId);
  }

  async restoreVersion(boardId: string, versionId: string): Promise<IBoardVersion> {
    const version = await this.boardRepository.getVersionById(versionId);
    if (!version) {
      throw ApiError.notFound('Version not found');
    }
    if (version.boardId.toString() !== boardId) {
      throw ApiError.badRequest('Version does not belong to this board');
    }
    return version;
  }
}
