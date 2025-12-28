import jwt from 'jsonwebtoken';
import { createLogger } from '../../services/shared/utils/logger.js';

const logger = createLogger('gateway-auth');

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/content',
  '/health',
  '/metrics'
];

/**
 * Authentication middleware
 * Verifies JWT tokens from Authorization header
 * Attaches user data to request if valid token
 */
export function authenticationMiddleware() {
  return (req, res, next) => {
    // Skip auth for public routes
    if (isPublicRoute(req.path, req.method)) {
      return next();
    }

    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        error: {
          message: 'No authentication token provided',
          statusCode: 401
        }
      });
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = payload;
      next();
    } catch (error) {
      logger.warn('Invalid token attempt', {
        error: error.message,
        ip: req.ip
      });

      return res.status(401).json({
        error: {
          message: 'Invalid or expired token',
          statusCode: 401
        }
      });
    }
  };
}

/**
 * Extract JWT token from Authorization header
 */
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Check if route is public
 */
function isPublicRoute(path, method) {
  // Exact matches
  if (PUBLIC_ROUTES.includes(path)) {
    return true;
  }

  // Pattern matches
  if (path.startsWith('/api/content/') && method === 'GET') {
    return true;
  }

  return false;
}

/**
 * Require authentication middleware
 * Use this on protected routes
 */
export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: {
        message: 'Authentication required',
        statusCode: 401
      }
    });
  }
  next();
}

/**
 * Require admin role
 */
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: {
        message: 'Admin access required',
        statusCode: 403
      }
    });
  }
  next();
}

/**
 * Require super admin role
 */
export function requireSuperAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({
      error: {
        message: 'Super admin access required',
        statusCode: 403
      }
    });
  }
  next();
}

export default authenticationMiddleware;
