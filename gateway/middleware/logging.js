import { createLogger } from '../../services/shared/utils/logger.js';

const logger = createLogger('gateway-logging');

/**
 * HTTP request logging middleware
 * Logs all incoming requests and response times
 */
export function loggingMiddleware() {
  return (req, res, next) => {
    const startTime = Date.now();

    // Capture response end to log complete request
    const originalSend = res.send;
    res.send = function(data) {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;

      logger.request(req.method, req.path, statusCode, duration);

      // Log errors
      if (statusCode >= 400) {
        logger.responseError(req.method, req.path, statusCode, {
          message: statusCode >= 500 ? 'Server error' : 'Client error'
        });
      }

      // Call original send
      return originalSend.call(this, data);
    };

    next();
  };
}

export default loggingMiddleware;
