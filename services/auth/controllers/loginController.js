/**
 * Login Controller
 *
 * POST /login
 * Authenticate user with email/password and return JWT token
 */

import jwt from 'jsonwebtoken';
import { getUserByEmail, verifyPassword, updateLastLogin } from '../models/user.js';
import { ValidationError, UnauthorizedError } from '../../shared/middleware/errorHandler.js';
import { createLogger } from '../../shared/utils/logger.js';

const logger = createLogger('auth-login');

/**
 * Login controller
 */
export async function loginController(req, res) {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw new ValidationError('Email and password required');
  }

  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new ValidationError('Email and password must be strings');
  }

  if (!email.includes('@')) {
    throw new ValidationError('Invalid email format');
  }

  // Find user
  logger.debug('Login attempt', { email });
  const user = await getUserByEmail(email);

  if (!user) {
    logger.warn('Login failed - user not found', { email });
    throw new UnauthorizedError('Invalid email or password');
  }

  // Verify password
  const passwordValid = await verifyPassword(password, user.password_hash);

  if (!passwordValid) {
    logger.warn('Login failed - invalid password', { email, userId: user.id });
    throw new UnauthorizedError('Invalid email or password');
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email
    },
    process.env.JWT_SECRET || 'your-secret-key-change-this',
    {
      expiresIn: '24h',
      issuer: 'auth-service',
      subject: user.id.toString()
    }
  );

  // Update last login
  await updateLastLogin(user.id);

  logger.info('User logged in successfully', {
    userId: user.id,
    email: user.email
  });

  // Return response
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username
    }
  });
}
