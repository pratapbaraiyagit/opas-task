import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be at most 50 characters').trim(),
  description: z.string().max(255, 'Description must be at most 255 characters').trim().optional(),
});

export const addMemberSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['owner', 'editor', 'viewer']).default('viewer'),
});

export const joinWorkspaceSchema = z.object({
  inviteCode: z.string().min(1, 'Invite code is required'),
});

export type CreateWorkspaceFormData = z.infer<typeof createWorkspaceSchema>;
export type AddMemberFormData = z.infer<typeof addMemberSchema>;
export type JoinWorkspaceFormData = z.infer<typeof joinWorkspaceSchema>;
