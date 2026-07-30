import mongoose, { Schema, Document, Types } from 'mongoose';
import { Role, ROLE_HIERARCHY } from '../../types/common';

export interface IWorkspaceMember {
  user: Types.ObjectId;
  role: Role;
  joinedAt: Date;
}

export interface IWorkspace extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  logo?: string;
  members: IWorkspaceMember[];
  owner: Types.ObjectId; // Denormalized for quick querying
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const memberSchema = new Schema<IWorkspaceMember>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: Object.keys(ROLE_HIERARCHY) as Role[],
      default: 'viewer',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }, // Prevent creating a separate _id for each subdocument
);

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
      minlength: [2, 'Workspace name must be at least 2 characters'],
      maxlength: [50, 'Workspace name must be at most 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [255, 'Description must be at most 255 characters'],
    },
    logo: {
      type: String,
    },
    members: [memberSchema],
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    inviteCode: {
      type: String,
      required: true,
      unique: true,
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

// Indexes
workspaceSchema.index({ owner: 1 });
workspaceSchema.index({ 'members.user': 1 });
workspaceSchema.index({ inviteCode: 1 });

export const Workspace = mongoose.model<IWorkspace>('Workspace', workspaceSchema);
