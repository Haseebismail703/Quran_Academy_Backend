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
    methods: ["GET", "POST", 'PUT', 'DELETE'],
    credentials: true,
  }
});

const activeUsers = new Map();

// ✅ Socket.IO Connection Handler
io.on("connection", (socket) => {
  socket.on("register", (userId) => {
    activeUsers.set(userId, socket.id);
  });
// console.log("connect",socket.id)
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
 // Add this to your socket.io implementation
socket.on('markAsRead', async ({ sender, receiver, messageId }) => {
  try {
      await MessageModel.updateMany(
          {
              sender,
              receiver,
              read: false
          },
          { $set: { read: true } }
      );
      
      // Notify the sender that messages were read
      io.to(sender).emit('messageRead', { 
          receiverId: receiver 
      });
  } catch (error) {
      console.error('Error marking messages as read:', error);
  }
});


// socket.on("unsendLastMessage", async ({ content ,sender, receiver, index }) => {
//   console.log(sender, receiver);
//   try {
//     // Latest message find karo
//     const lastMessage = await MessageModel.findOne({
//       $or: [
//         { sender, receiver ,content},
//         { sender: receiver, receiver: sender }
//       ]
//     }).sort({ createdAt: -1 });

//     if (!lastMessage) return;

//     // Update content
//     lastMessage.content = "This message was deleted";
//     const updatedMessage = await lastMessage.save(); // Saving updated message

//     console.log("Updated message in DB:", updatedMessage); // Log the updated message to check

//     // Prepare data to emit
//     const updatePayload = {
//       index, // Attach index to payload
//       content: updatedMessage.content,
//     };

//     // Emit to both users
//     const senderSocket = activeUsers.get(sender);
//     const receiverSocket = activeUsers.get(receiver);

//     if (senderSocket) {
//       io.to(senderSocket).emit("messageUnsent", updatePayload);
//     }
//     if (receiverSocket) {
//       io.to(receiverSocket).emit("messageUnsent", updatePayload);
//     }

//   } catch (error) {
//     console.error("Error unsending message:", error);
//   }
// });




  socket.on("disconnect", () => {
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        break;
      }
    }
    // console.log("User disconnected:", socket.id);
  });



});

// ✅ Middleware and Route Setup
app.use(express.json());
app.use(cookieParser());
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
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
