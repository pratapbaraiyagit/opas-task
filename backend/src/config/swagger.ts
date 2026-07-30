import swaggerJsdoc from 'swagger-jsdoc';

import { env } from '@config/env';

const swaggerDefinition: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Opash Software task - Collaborative Whiteboard & Meeting Notes API',
      version: '1.0.0',
      description:
        'Production-ready REST API for the Collaborative Real-Time Whiteboard & Meeting Notes Platform',
      contact: {
        name: 'Opash Software task Team',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: {
              type: 'array',
              items: { type: 'object' },
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/modules/*/routes.ts', './src/modules/*/*.routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(swaggerDefinition);
