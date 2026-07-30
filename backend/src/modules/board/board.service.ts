import { ApiError } from '@utils/ApiError';
import { WorkspaceRepository } from '@modules/workspace/workspace.repository';
import { BoardRepository } from './board.repository';
import { CreateBoardDto, UpdateBoardDto } from './board.dto';
import { IBoard } from './board.model';

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

  async getWorkspaceBoards(workspaceId: string): Promise<IBoard[]> {
    return this.boardRepository.findAllByWorkspace(workspaceId);
  }

  async getStarredBoards(userId: string): Promise<IBoard[]> {
    return this.boardRepository.findAllStarredByUser(userId);
  }

  async getBoardById(boardId: string, userId: string): Promise<IBoard> {
    const board = await this.boardRepository.findById(boardId);
    if (!board) {
      throw ApiError.notFound('Board not found');
    }

    // Check if user has access via workspace
    const workspace = await this.workspaceRepository.findById(board.workspaceId.toString());
    const isMember = workspace?.members.some((m) => m.user._id.toString() === userId);

    if (!isMember && !board.isPublic) {
      throw ApiError.forbidden('You do not have access to this board');
    }

    // Update last opened asynchronously
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
}
