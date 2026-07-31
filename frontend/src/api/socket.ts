import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const getSocketUrl = (): string => {
  const socketUrl = import.meta.env.VITE_SOCKET_URL;
  if (socketUrl) {
    return socketUrl;
  }

  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl?.startsWith('http')) {
    return apiUrl.replace(/\/api\/?$/, '');
  }

  return window.location.origin;
};

export const initSocket = (token: string): Socket => {
  if (socket) return socket;

  socket = io(getSocketUrl(), {
    auth: { token },
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
