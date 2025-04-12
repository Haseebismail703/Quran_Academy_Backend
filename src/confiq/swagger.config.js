import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";
dotenv.config();

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
        url: `http://localhost:${process.env.PORT}`,
      },
      {
        url: "https://quran-academy-backend.vercel.app",
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
    "../controler/authController.js",
    "../SwagerDoc/auth.swagger.js",
    "../controler/billingControler.js",
    "../SwagerDoc/billing.swagger.js",
    "../controler/reviewController.js",
    "../SwagerDoc/review.swagger.js",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCssUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui.min.css",
      customJs:
        "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-bundle.min.js",
    })
  );
};

export default setupSwagger;
