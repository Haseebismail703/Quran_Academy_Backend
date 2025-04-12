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

const PORT = process.env.PORT || 3000



const Db = Db_connection.connection
Db.on('error', console.error.bind(console, 'Error connection'))
Db.once('open', () => {
    console.log('Db connected');
})


const corsOptions = {
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow credentials (cookies)
};

app.use(cors(corsOptions));
app.use('/api', route)
app.use(cookieParser());
app.listen(PORT, () => {
    console.log(`Server is running http://localhost:${PORT}`);

})
// Swagger definition
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: 'Online Quran Academy - API Documentation',
      version: '1.0.0',
      description: 'API for Online Quran Academy with authentication routes.',
    },
    servers: [
      {
        url: 'http://localhost:5000',
      },
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
  
  
  // Initialize swagger-jsdoc
  const swaggerSpec = swaggerJsdoc(options);
  
  // Set up Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));