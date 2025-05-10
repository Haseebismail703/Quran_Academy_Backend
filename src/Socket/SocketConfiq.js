import { Server } from 'socket.io';
import { handleSocketEvents } from './handlers.js';

const activeUsers = new Map();

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://192.168.2.63:5173"],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    handleSocketEvents(socket, io, activeUsers);
  });
};
