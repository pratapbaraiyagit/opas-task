import { Router } from 'express';
import { generateActionItems } from './ai.controller';
import { authenticate } from '@middlewares/authenticate';

const router = Router();

// Endpoint doesn't necessarily need auth if we allow anonymous users to use the board, 
// but we'll protect it if possible, or leave it unprotected if anonymous access is supported.
// Given anonymous token logic in the frontend, it should work with `authenticate`.
router.post('/action-items', authenticate, generateActionItems);

export default router;
