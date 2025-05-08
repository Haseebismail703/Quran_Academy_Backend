import express from 'express';
import cors from 'cors';
import { configDotenv } from 'dotenv';
import Db_connection from './src/confiq/db.js';
import route from './src/route/routes.js';
import cookieParser from 'cookie-parser';
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import http from 'http';
import { Server } from 'socket.io';
import MessageModel from './src/model/chatModel.js';

configDotenv();
const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  }
});

const activeUsers = new Map();

// ✅ Socket.IO Connection Handler
io.on("connection", (socket) => {
  socket.on("register", (userId) => {
    activeUsers.set(userId, socket.id);
  });

  socket.on("sendMessage", async ({ sender, receiver, content }) => {
    try {
      const message = await MessageModel.create({ sender, receiver, content });

      const receiverSocket = activeUsers.get(receiver);
      if (receiverSocket) {
        io.to(receiverSocket).emit("receiveMessage", message);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  // ✅ Handle read messages
  socket.on("markAsRead", async ({ sender, receiver }) => {
    try {
      const unreadMessages = await MessageModel.find({
        sender,
        receiver,
        read: false
      });

      for (const message of unreadMessages) {
        message.read = true;
        await message.save();

        const readerSocket = activeUsers.get(receiver);
        if (readerSocket) {
          io.to(readerSocket).emit("messageRead", { messageId: message._id });
        }
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        break;
      }
    }
    console.log("User disconnected:", socket.id);
  });
});

// ✅ Middleware and Route Setup
app.use(express.json());
app.use(cookieParser());
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

// ✅ DB Connection
const Db = Db_connection.connection;
Db.on('error', console.error.bind(console, 'Error connection'));
Db.once('open', () => {
  console.log('Db connected');
});

// ✅ Routes
app.use('/api', route);

// ✅ Swagger Setup
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Online Quran Academy - API Documentation",
      version: "1.0.0",
      description: "This is the official API documentation for the Online Quran Academy platform.",
    },
    servers: [
      { url: `http://localhost:${PORT}` },
      { url: "https://quranacademybackend-production.up.railway.app" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    './src/controler/authController.js',
    './src/SwagerDoc/auth.swagger.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ✅ Start Server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Swagger Docs available at http://localhost:${PORT}/docs`);
});
