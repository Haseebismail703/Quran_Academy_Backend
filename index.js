import express from 'express'
import cors from 'cors'
import { configDotenv } from 'dotenv'
import Db_connection from './src/confiq/db.js'
import route from './src/route/routes.js'
import cookieParser from 'cookie-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

configDotenv()

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 5000

// --- CORS Setup ---
const corsOptions = {
  origin: ['http://localhost:5173'], // add production URL too if needed
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

// --- DB Connection ---
const Db = Db_connection.connection
Db.on('error', console.error.bind(console, 'Error connection'))
Db.once('open', () => {
  console.log('Db connected');
})

// --- Routes ---
app.use('/api', route)
app.use(cookieParser());

// --- Swagger Definition ---
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Online Quran Academy - API Documentation',
    version: '1.0.0',
    description: 'API for Online Quran Academy with authentication, billing, and review routes.',
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
    },
    {
      url: 'https://quran-academy-backend.vercel.app',
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

// --- Swagger Options ---
const options = {
  definition: swaggerDefinition,
  apis: [
    './src/controler/authController.js',
    './src/SwagerDoc/auth.swagger.js',
    './src/controler/billingControler.js',
    './src/SwagerDoc/billing.swagger.js',
    './src/controler/reviewController.js',
    './src/SwagerDoc/review.swagger.js'
  ],
};

// --- Initialize Swagger ---
const swaggerSpec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Server Start ---
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Swagger Docs at http://localhost:${PORT}/api-docs`);
});
