import express from 'express';
import cors from 'cors';
import { configDotenv } from 'dotenv';
import Db_connection from './src/confiq/db.js';
import route from './src/route/routes.js';
import cookieParser from 'cookie-parser';
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

// Load environment variables
configDotenv();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());

// --- CORS Setup ---
const corsOptions = {
  origin: ['http://localhost:5173'], // Add production URL too
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

// --- DB Connection ---
const Db = Db_connection.connection;
Db.on('error', console.error.bind(console, 'Error connection'));
Db.once('open', () => {
  console.log('Db connected');
});

// --- Routes ---
app.use('/api', route);

// --- Swagger Setup ---
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Online Quran Academy - API Documentation",
      version: "1.0.0",
      description: "This is the official API documentation for the Online Quran Academy platform, covering authentication, billing, and reviews.",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
      {
        url: "https://quranacademybackend-production.up.railway.app",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/controler/authController.js',
    './src/SwagerDoc/auth.swagger.js',
    './src/controler/billingControler.js',
    './src/SwagerDoc/billing.swagger.js',
    './src/controler/reviewController.js',
    './src/SwagerDoc/review.swagger.js'
  ],
};

const swaggerSpec = swaggerJsdoc(options);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Server Start ---
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Swagger Docs available at http://localhost:${PORT}/docs`);
});
