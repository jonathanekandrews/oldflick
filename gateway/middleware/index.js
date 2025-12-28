/**
 * Gateway middleware configuration
 * Applies logging, rate limiting, authentication, etc to all requests
 */

import { createLogger } from '../../services/shared/utils/logger.js';
import { loggingMiddleware } from './logging.js';
import { rateLimitMiddleware } from './rateLimit.js';
import { authenticationMiddleware } from './authentication.js';

const logger = createLogger('gateway-middleware');

/**
 * Setup all middleware in correct order
 */
export function setupMiddleware(app) {
  // 1. Logging - capture all requests
  app.use(loggingMiddleware());

  // 2. Rate limiting - prevent abuse
  app.use(rateLimitMiddleware());

  // 3. Authentication - verify tokens (optional for some routes)
  app.use(authenticationMiddleware());

  logger.info('All middleware configured');
}

export default setupMiddleware;
