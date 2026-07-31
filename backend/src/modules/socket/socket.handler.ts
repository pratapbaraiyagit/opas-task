import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import jwt from 'jsonwebtoken';

import { env, getClientOrigins } from '@config/env';
import { getRedisPublisher, getRedisSubscriber } from '@config/redis';
import { getBoardAccess } from '@services/boardAccess.service';
import { applyNotesUpdate, getNotesStateArray } from '@services/notes.service';
import { BoardRepository } from '@modules/board/board.repository';
import { logger } from '@utils/logger';

interface JwtPayload {
  id: string;
  email: string;
  name: string;
  isAnonymous?: boolean;
}

const boardRepository = new BoardRepository();

const authorizeBoardEvent = async (
  socket: Socket,
  boardId: string,
  requireEdit: boolean,
): Promise<boolean> => {
  if (!boardId || typeof boardId !== 'string') {
    return false;
  }

  const user = socket.data.user as JwtPayload;
  const access = await getBoardAccess(user.id, !!user.isAnonymous, boardId);

  if (!access?.canView) {
    return false;
  }

  if (requireEdit && !access.canEdit) {
    return false;
  }

  return true;
};

export const initializeSocket = async (httpServer: HttpServer): Promise<Server> => {
  const io = new Server(httpServer, {
    cors: {
      origin: getClientOrigins(),
      methods: ['GET', 'POST'],
      credentials: true,
    },
    maxHttpBufferSize: 1e7,
  });

  try {
    const pubClient = getRedisPublisher();
    const subClient = getRedisSubscriber();
    io.adapter(createAdapter(pubClient, subClient));
    logger.info('✅ Socket.IO Redis adapter enabled');
  } catch (error) {
    logger.warn('⚠️ Socket.IO running without Redis adapter:', (error as Error).message);
  }

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
      socket.data.user = decoded;
      next();
    } catch {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`Socket connected: ${socket.id} (User: ${socket.data.user.id})`);

    socket.on('join_board', async (boardId: string) => {
      const allowed = await authorizeBoardEvent(socket, boardId, false);
      if (!allowed) {
        socket.emit('error', { message: 'Access denied to this board' });
        return;
      }

      socket.join(boardId);

      const board = await boardRepository.findById(boardId);
      socket.emit('canvas:state', board?.shapes ?? []);

      const notesState = await getNotesStateArray(boardId);
      if (notesState.length > 0) {
        socket.emit('yjs:sync', notesState);
      }

      logger.info(`Socket ${socket.id} joined board ${boardId}`);
    });

    socket.on('leave_board', async (boardId: string) => {
      const allowed = await authorizeBoardEvent(socket, boardId, false);
      if (!allowed) {
        return;
      }

      socket.leave(boardId);
      logger.info(`Socket ${socket.id} left board ${boardId}`);
    });

    socket.on('shape:add', async ({ boardId, shape }) => {
      if (!(await authorizeBoardEvent(socket, boardId, true))) {
        socket.emit('error', { message: 'Not authorized to edit this board' });
        return;
      }
      await boardRepository.addShape(boardId, shape);
      socket.to(boardId).emit('shape:add', shape);
    });

    socket.on('shape:update', async ({ boardId, shapeId, attrs }) => {
      if (!(await authorizeBoardEvent(socket, boardId, true))) {
        socket.emit('error', { message: 'Not authorized to edit this board' });
        return;
      }
      await boardRepository.updateShapeInCanvas(boardId, shapeId, attrs);
      socket.to(boardId).emit('shape:update', { shapeId, attrs });
    });

    socket.on('shape:delete', async ({ boardId, shapeIds }) => {
      if (!(await authorizeBoardEvent(socket, boardId, true))) {
        socket.emit('error', { message: 'Not authorized to edit this board' });
        return;
      }
      await boardRepository.deleteShapesFromCanvas(boardId, shapeIds);
      socket.to(boardId).emit('shape:delete', shapeIds);
    });

    socket.on('board:restored', async ({ boardId, shapes }) => {
      if (!(await authorizeBoardEvent(socket, boardId, true))) {
        socket.emit('error', { message: 'Not authorized to edit this board' });
        return;
      }
      await boardRepository.setShapes(boardId, shapes);
      socket.to(boardId).emit('board:restored', shapes);
    });

    socket.on('cursor:move', async ({ boardId, cursor }) => {
      if (!(await authorizeBoardEvent(socket, boardId, false))) {
        return;
      }

      const user = socket.data.user as JwtPayload;
      socket.to(boardId).emit('cursor:move', {
        userId: user.id,
        userName: user.name,
        ...cursor,
      });
    });

    socket.on('yjs:update', async ({ boardId, update }) => {
      if (!(await authorizeBoardEvent(socket, boardId, true))) {
        socket.emit('error', { message: 'Not authorized to edit meeting notes on this board' });
        return;
      }
      await applyNotesUpdate(boardId, update);
      socket.to(boardId).emit('yjs:update', update);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};
