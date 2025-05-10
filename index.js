import express from 'express';
import { configDotenv } from 'dotenv';
import http from 'http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import Db_connection from './src/confiq/db.js';
import route from './src/route/routes.js';
import { setupSocket } from './src/Socket/SocketConfiq.js';

configDotenv();
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// ✅ Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:5173", "http://192.168.2.63:5173"],
  credentials: true,
}));

// ✅ Routes
app.use('/api', route);

// ✅ Swagger
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Online Quran Academy - API Documentation",
      version: "1.0.0",
    },
    servers: [
      { url: `http://localhost:${PORT}` },
      { url: "https://quranacademybackend-production.up.railway.app" },
    ],
  },
  apis: ['./src/controler/authController.js', './src/SwagerDoc/auth.swagger.js'],
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ✅ DB
const Db = Db_connection.connection;
Db.once('open', () => console.log('DB connected'));

// ✅ Socket Setup
setupSocket(server);

// ✅ Start Server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Swagger Docs: http://localhost:${PORT}/docs`);
});
