import { Types } from 'mongoose';
import { Board, IBoard } from './board.model';
import { BoardVersion, IBoardVersion } from './board-version.model';
import { CreateBoardDto } from './board.dto';
import { User } from '../auth/auth.model';

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
      const matchingUsers = await User.find({
        $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }]
      }).select('_id');
      const userIds = matchingUsers.map(u => u._id);

      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { createdBy: { $in: userIds } }
      ];
    }
    return Board.find(query)
      .populate('createdBy', 'name email avatar')
      .sort({ updatedAt: -1 });
  }

  async findAllStarredByUser(userId: string, search?: string): Promise<IBoard[]> {
    const query: any = { starredBy: new Types.ObjectId(userId) };
    if (search) {
      const matchingUsers = await User.find({
        $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }]
      }).select('_id');
      const userIds = matchingUsers.map(u => u._id);

      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { createdBy: { $in: userIds } }
      ];
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

  async addShape(boardId: string, shape: Record<string, unknown>): Promise<void> {
    await Board.updateOne(
      { _id: new Types.ObjectId(boardId) },
      { $push: { shapes: shape } },
    );
  }

  async updateShapeInCanvas(
    boardId: string,
    shapeId: string,
    attrs: Record<string, unknown>,
  ): Promise<void> {
    const board = await Board.findById(boardId);
    if (!board) return;

    const shapes = board.shapes.map((shape) => {
      const s = shape as { id?: string };
      return s.id === shapeId ? { ...shape, ...attrs } : shape;
    });

    await Board.updateOne({ _id: new Types.ObjectId(boardId) }, { $set: { shapes } });
  }

  async deleteShapesFromCanvas(boardId: string, shapeIds: string[]): Promise<void> {
    const board = await Board.findById(boardId);
    if (!board) return;

    const shapes = board.shapes.filter((shape) => {
      const s = shape as { id?: string };
      return !shapeIds.includes(s.id ?? '');
    });

    await Board.updateOne({ _id: new Types.ObjectId(boardId) }, { $set: { shapes } });
  }

  async setShapes(boardId: string, shapes: Record<string, unknown>[]): Promise<void> {
    await Board.updateOne(
      { _id: new Types.ObjectId(boardId) },
      { $set: { shapes } },
    );
  }

  async updateNotesState(boardId: string, state: Buffer): Promise<void> {
    await Board.updateOne(
      { _id: new Types.ObjectId(boardId) },
      { $set: { notesYjsState: state } },
    );
  }

  async getNotesState(boardId: string): Promise<Buffer | null> {
    const board = await Board.findById(boardId).select('notesYjsState');
    return board?.notesYjsState ?? null;
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
