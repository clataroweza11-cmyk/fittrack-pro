import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FitTrack Pro API',
      version: '1.0.0',
      description: 'Full-stack Fitness Tracking System REST API',
      contact: {
        name: 'FitTrack Pro Team',
        email: 'support@fittrackpro.com',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://fittrack-pro-1-8zno.onrender.com'
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' ? 'Production' : 'Development',
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
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['admin', 'user'] },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Workout: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            type: { type: 'string', enum: ['cardio', 'strength', 'flexibility', 'sports'] },
            duration: { type: 'integer', description: 'Duration in minutes' },
            calories_burned: { type: 'integer' },
            notes: { type: 'string' },
            date: { type: 'string', format: 'date' },
          },
        },
        Profile: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            weight: { type: 'number', description: 'Weight in kg' },
            height: { type: 'number', description: 'Height in cm' },
            goal: { type: 'string' },
            activity_level: { type: 'string' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts'], // Scan route files for JSDoc comments
};

export const swaggerSpec = swaggerJsdoc(options);
