import { Types } from 'mongoose';
import { Board, IBoard } from './board.model';
import { BoardVersion, IBoardVersion } from './board-version.model';
import { CreateBoardDto } from './board.dto';

export class BoardRepository {
  async create(userId: string, data: CreateBoardDto): Promise<IBoard> {
    const board = new Board({
      ...data,
      workspaceId: new Types.ObjectId(data.workspaceId),
      createdBy: new Types.ObjectId(userId),
      lastOpenedAt: new Map([[userId, new Date()]]),
    });
    return board.save();
  }

  async findById(id: string): Promise<IBoard | null> {
    return Board.findById(id).populate('createdBy', 'name email avatar');
  }

  async findAllByWorkspace(workspaceId: string, search?: string): Promise<IBoard[]> {
    const query: any = { workspaceId: new Types.ObjectId(workspaceId) };
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    return Board.find(query)
      .populate('createdBy', 'name email avatar')
      .sort({ updatedAt: -1 });
  }

  async findAllStarredByUser(userId: string, search?: string): Promise<IBoard[]> {
    const query: any = { starredBy: new Types.ObjectId(userId) };
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    return Board.find(query)
      .populate('createdBy', 'name email avatar')
      .sort({ updatedAt: -1 });
  }

  async findRecentBoards(userId: string): Promise<IBoard[]> {
    return Board.find({ [`lastOpenedAt.${userId}`]: { $exists: true } })
      .populate('createdBy', 'name email avatar')
      .sort({ [`lastOpenedAt.${userId}`]: -1 })
      .limit(4);
  }

  async update(id: string, data: Partial<IBoard>): Promise<IBoard | null> {
    return Board.findByIdAndUpdate(id, data, { new: true }).populate('createdBy', 'name email avatar');
  }

  async delete(id: string): Promise<IBoard | null> {
    return Board.findByIdAndDelete(id);
  }

  async toggleStar(id: string, userId: string, isStarred: boolean): Promise<IBoard | null> {
    const update = isStarred
      ? { $pull: { starredBy: new Types.ObjectId(userId) } }
      : { $addToSet: { starredBy: new Types.ObjectId(userId) } };
      
    return Board.findByIdAndUpdate(id, update, { new: true });
  }

  async updateLastOpened(id: string, userId: string): Promise<void> {
    await Board.updateOne(
      { _id: new Types.ObjectId(id) },
      { $set: { [`lastOpenedAt.${userId}`]: new Date() } }
    );
  }

  async saveVersion(boardId: string, userId: string, versionName: string, shapes: any[]): Promise<IBoardVersion> {
    const version = new BoardVersion({
      boardId: new Types.ObjectId(boardId),
      versionName,
      shapes,
      createdBy: new Types.ObjectId(userId),
    });
    return version.save();
  }

  async getVersions(boardId: string): Promise<IBoardVersion[]> {
    return BoardVersion.find({ boardId: new Types.ObjectId(boardId) })
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 });
  }

  async getVersionById(versionId: string): Promise<IBoardVersion | null> {
    return BoardVersion.findById(versionId).populate('createdBy', 'name email avatar');
  }
}
