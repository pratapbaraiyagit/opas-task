import { Router } from 'express';

import authRoutes from '@modules/auth/auth.routes';
import workspaceRoutes from '@modules/workspace/workspace.routes';
import { singleBoardRouter, workspaceBoardsRouter } from '@modules/board/board.routes';
import aiRoutes from '@modules/ai/ai.routes';

const router = Router();

/**
 * Health check endpoint
 */
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Opash Software task API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

import usersRoutes from '@modules/users/users.routes';

// Module routes will be registered here in subsequent phases
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/workspaces/:id/boards', workspaceBoardsRouter);
router.use('/boards', singleBoardRouter);
// router.use('/exports', exportRoutes);
// router.use('/version-history', versionHistoryRoutes);
// router.use('/share', shareRoutes);
router.use('/ai', aiRoutes);

export default router;
