import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBoardVersion extends Document {
  _id: Types.ObjectId;
  boardId: Types.ObjectId;
  versionName: string;
  shapes: any[]; // Stores array of CanvasShape
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const boardVersionSchema = new Schema<IBoardVersion>(
  {
    boardId: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
      index: true,
    },
    versionName: {
      type: String,
      required: [true, 'Version name is required'],
      trim: true,
      maxlength: [100, 'Version name must be at most 100 characters'],
    },
    shapes: {
      type: Schema.Types.Mixed,
      default: [],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const BoardVersion = mongoose.model<IBoardVersion>('BoardVersion', boardVersionSchema);
