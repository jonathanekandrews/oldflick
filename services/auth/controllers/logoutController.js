/**
 * Logout Controller
 *
 * POST /logout
 * Invalidate user session (currently stateless JWT)
 */

import { createLogger } from '../../shared/utils/logger.js';

const logger = createLogger('auth-logout');

/**
 * Logout controller
 *
 * Note: With stateless JWT, logout is handled client-side by deleting token.
 * For enhanced security, could implement token blacklist (Redis).
 */
export async function logoutController(req, res) {
  const userId = req.headers['x-user-id'];

  logger.info('User logged out', { userId });

  res.json({
    message: 'Logged out successfully'
  });
}
