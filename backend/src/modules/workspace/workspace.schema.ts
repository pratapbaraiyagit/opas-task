import { z } from 'zod';
import { ROLE_HIERARCHY } from '../../types/common';

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters')
    .trim(),
  description: z
    .string()
    .max(255, 'Description must be at most 255 characters')
    .trim()
    .optional(),
});

export const updateWorkspaceSchema = createWorkspaceSchema.partial();

export const addMemberSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase().trim(),
  role: z.enum(Object.keys(ROLE_HIERARCHY) as [string, ...string[]]).default('viewer'),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(Object.keys(ROLE_HIERARCHY) as [string, ...string[]]),
});

export const joinWorkspaceSchema = z.object({
  inviteCode: z.string().min(1, 'Invite code is required'),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type JoinWorkspaceInput = z.infer<typeof joinWorkspaceSchema>;
