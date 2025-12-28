/**
 * API Gateway - Single entry point for all microservices
 * Routes requests to appropriate services with health checks and circuit breakers
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createLogger } from '../services/shared/utils/logger.js';
import { createCircuitBreakers } from '../services/shared/utils/circuitBreaker.js';
import {
  errorHandler,
  notFoundHandler,
  APIError
} from '../services/shared/middleware/errorHandler.js';
import routes from './routes.js';
import { setupMiddleware } from './middleware/index.js';

dotenv.config();

const app = express();
const logger = createLogger('gateway');
const port = process.env.GATEWAY_PORT || 3000;

// Service registry
export const serviceRegistry = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  content: process.env.CONTENT_SERVICE_URL || 'http://localhost:3002',
  users: process.env.USERS_SERVICE_URL || 'http://localhost:3003',
  payments: process.env.PAYMENTS_SERVICE_URL || 'http://localhost:3004',
  media: process.env.MEDIA_SERVICE_URL || 'http://localhost:3005',
  admin: process.env.ADMIN_SERVICE_URL || 'http://localhost:3006'
};

// Circuit breakers for each service
export const circuitBreakers = createCircuitBreakers();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5000',
  credentials: true
}));

// Setup all middleware (logging, rate limiting, auth, etc)
setupMiddleware(app);

// Routes
app.use('/', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    service: 'gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {}
  };

  // Report circuit breaker status
  for (const [serviceName, breaker] of Object.entries(circuitBreakers)) {
    health.services[serviceName] = breaker.getStatus();
  }

  res.json(health);
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  const metrics = {
    gateway: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    },
    services: {}
  };

  for (const [name, breaker] of Object.entries(circuitBreakers)) {
    metrics.services[name] = breaker.getStatus();
  }

  res.json(metrics);
});

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

/**
 * Start gateway
 */
export async function startGateway() {
  try {
    app.listen(port, () => {
      logger.serviceStarted('API Gateway', port);
      logger.info('Service registry', { services: serviceRegistry });
    });
  } catch (error) {
    logger.fatal('Failed to start gateway', { error: error.message });
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start gateway if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startGateway();
}

export default app;
