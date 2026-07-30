import { Router } from 'express';
import { authenticate } from '@middlewares/authenticate';
import { getMe } from './users.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile management
 */

router.use(authenticate);

router.get('/me', getMe);

export default router;
