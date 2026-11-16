import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Авторизация сокета по JWT: нельзя «представиться» чужим userId
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No token'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = String(decoded.id);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    // Личная комната пользователя: туда приходят сообщения и уведомления
    socket.join(`user:${socket.userId}`);
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
};

// Безопасная отправка события конкретному пользователю
export const emitToUser = (userId, event, payload) => {
  try {
    getIO().to(`user:${String(userId)}`).emit(event, payload);
  } catch (e) {
    console.error('emitToUser error:', e.message);
  }
};

// Рассылка всем подключённым клиентам (обновление поста: лайки/комменты)
export const emitToAll = (event, payload) => {
  try {
    getIO().emit(event, payload);
  } catch (e) {
    console.error('emitToAll error:', e.message);
  }
};
