import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '@config/env';
import { logger } from '@utils/logger';

interface JwtPayload {
  id: string;
  email: string;
  name: string;
}

export const initializeSocket = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`Socket connected: ${socket.id} (User: ${socket.data.user.id})`);

    // Join a specific board room
    socket.on('join_board', (boardId: string) => {
      socket.join(boardId);
      logger.info(`Socket ${socket.id} joined board ${boardId}`);
    });

    // Leave a specific board room
    socket.on('leave_board', (boardId: string) => {
      socket.leave(boardId);
      logger.info(`Socket ${socket.id} left board ${boardId}`);
    });

    // Handle shape actions and broadcast to room
    socket.on('shape:add', ({ boardId, shape }) => {
      socket.to(boardId).emit('shape:add', shape);
    });

    socket.on('shape:update', ({ boardId, shapeId, attrs }) => {
      socket.to(boardId).emit('shape:update', { shapeId, attrs });
    });

    socket.on('shape:delete', ({ boardId, shapeIds }) => {
      socket.to(boardId).emit('shape:delete', shapeIds);
    });

    // Handle cursor movement (for Phase 8)
    socket.on('cursor:move', ({ boardId, cursor }) => {
      socket.to(boardId).emit('cursor:move', { 
        userId: socket.data.user.id, 
        userName: socket.data.user.name,
        ...cursor 
      });
    });

    // Handle Yjs document sync for Meeting Notes (Phase 7)
    socket.on('yjs:update', ({ boardId, update }) => {
      socket.to(boardId).emit('yjs:update', update);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};
