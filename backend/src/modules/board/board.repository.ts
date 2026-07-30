import { Types } from 'mongoose';
import { Board, IBoard } from './board.model';
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

  async findAllByWorkspace(workspaceId: string): Promise<IBoard[]> {
    return Board.find({ workspaceId: new Types.ObjectId(workspaceId) })
      .populate('createdBy', 'name email avatar')
      .sort({ updatedAt: -1 });
  }

  async findAllStarredByUser(userId: string): Promise<IBoard[]> {
    return Board.find({ starredBy: new Types.ObjectId(userId) })
      .populate('createdBy', 'name email avatar')
      .sort({ updatedAt: -1 });
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
}
