import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBoard extends Document {
  _id: Types.ObjectId;
  workspaceId: Types.ObjectId;
  title: string;
  thumbnail?: string;
  starredBy: Types.ObjectId[];
  createdBy: Types.ObjectId;
  lastOpenedAt: Map<string, Date>; // UserID -> Date
  isPublic: boolean;
  publicRole: 'VIEWER' | 'EDITOR';
  publicExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const boardSchema = new Schema<IBoard>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Board title is required'],
      trim: true,
      maxlength: [100, 'Board title must be at most 100 characters'],
    },
    thumbnail: {
      type: String,
    },
    starredBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastOpenedAt: {
      type: Map,
      of: Date,
      default: {},
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    publicRole: {
      type: String,
      enum: ['VIEWER', 'EDITOR'],
      default: 'VIEWER',
    },
    publicExpiresAt: {
      type: Date,
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

boardSchema.index({ workspaceId: 1, updatedAt: -1 });

export const Board = mongoose.model<IBoard>('Board', boardSchema);
