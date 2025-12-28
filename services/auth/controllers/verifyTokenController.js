/**
 * Verify Token Controller
 *
 * POST /verify-token
 * Used internally by gateway and other services to verify JWT validity
 */

import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../../shared/middleware/errorHandler.js';
import { createLogger } from '../../shared/utils/logger.js';

const logger = createLogger('auth-verify');

/**
 * Verify token validity
 */
export async function verifyTokenController(req, res) {
  const { token } = req.body;

  if (!token) {
    throw new UnauthorizedError('Token required');
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-this'
    );

    logger.debug('Token verified', { userId: payload.id });

    res.json({
      valid: true,
      payload
    });
  } catch (error) {
    logger.warn('Invalid token', { error: error.message });

    throw new UnauthorizedError('Invalid or expired token');
  }
}
