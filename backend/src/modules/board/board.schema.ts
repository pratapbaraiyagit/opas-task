import { z } from 'zod';

export const createBoardSchema = z.object({
  title: z
    .string()
    .min(1, 'Board title is required')
    .max(100, 'Board title must be at most 100 characters')
    .trim(),
  workspaceId: z.string().min(1, 'Workspace ID is required'),
});

export const updateBoardSchema = z.object({
  title: z
    .string()
    .min(1, 'Board title is required')
    .max(100, 'Board title must be at most 100 characters')
    .trim()
    .optional(),
  isPublic: z.boolean().optional(),
  publicRole: z.enum(['VIEWER', 'EDITOR']).optional(),
});
