/**
 * Rate limiting middleware
 * Prevents abuse by limiting requests per IP address
 */

const requestCounts = new Map();
const WINDOW_SIZE = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.windowStart > WINDOW_SIZE) {
      requestCounts.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limit middleware
 */
export function rateLimitMiddleware() {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!requestCounts.has(clientIP)) {
      requestCounts.set(clientIP, {
        count: 0,
        windowStart: now
      });
    }

    const data = requestCounts.get(clientIP);

    // Reset window if expired
    if (now - data.windowStart > WINDOW_SIZE) {
      data.count = 0;
      data.windowStart = now;
    }

    data.count++;

    // Check if limit exceeded
    if (data.count > MAX_REQUESTS_PER_WINDOW) {
      return res.status(429).json({
        error: {
          message: 'Too many requests',
          statusCode: 429,
          retryAfter: Math.ceil((data.windowStart + WINDOW_SIZE - now) / 1000)
        }
      });
    }

    next();
  };
}

export default rateLimitMiddleware;
