import { Router } from 'express';

const router = Router();

/**
 * Health check endpoint
 */
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'OPAS API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Module routes will be registered here in subsequent phases
// router.use('/auth', authRoutes);
// router.use('/workspaces', workspaceRoutes);
// router.use('/boards', boardRoutes);
// router.use('/notes', notesRoutes);
// router.use('/exports', exportRoutes);
// router.use('/version-history', versionHistoryRoutes);
// router.use('/share', shareRoutes);
// router.use('/ai', aiRoutes);

export default router;
