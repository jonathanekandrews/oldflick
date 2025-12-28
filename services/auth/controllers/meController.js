/**
 * Me Controller
 *
 * GET /me
 * Return authenticated user information
 */

import { getUserById } from '../models/user.js';
import { UnauthorizedError } from '../../shared/middleware/errorHandler.js';
import { createLogger } from '../../shared/utils/logger.js';

const logger = createLogger('auth-me');

/**
 * Get authenticated user
 */
export async function meController(req, res) {
  // Get user ID from Authorization header (verified by gateway)
  const userId = req.headers['x-user-id'];

  if (!userId) {
    throw new UnauthorizedError('User ID not found in request');
  }

  // Fetch user from database
  const user = await getUserById(parseInt(userId));

  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  logger.debug('Get user info', { userId });

  res.json({
    id: user.id,
    email: user.email,
    username: user.username,
    createdAt: user.created_at,
    updatedAt: user.updated_at
  });
}
