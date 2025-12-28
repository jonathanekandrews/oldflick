/**
 * Register Controller
 *
 * POST /register
 * Create new user account and return JWT token
 */

import jwt from 'jsonwebtoken';
import { createUser, userExists } from '../models/user.js';
import { ValidationError } from '../../shared/middleware/errorHandler.js';
import { createLogger } from '../../shared/utils/logger.js';

const logger = createLogger('auth-register');

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Requirements: min 8 chars, uppercase, lowercase, number, special char
 */
function isStrongPassword(password) {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
  return true;
}

/**
 * Register controller
 */
export async function registerController(req, res) {
  const { email, password, passwordConfirm, username } = req.body;

  // Validate input
  if (!email || !password || !passwordConfirm || !username) {
    throw new ValidationError('Email, password, password confirmation, and username required');
  }

  if (typeof email !== 'string' || typeof password !== 'string' || typeof username !== 'string') {
    throw new ValidationError('All fields must be strings');
  }

  // Validate email
  if (!isValidEmail(email)) {
    throw new ValidationError('Invalid email format');
  }

  // Validate username
  if (username.length < 2 || username.length > 100) {
    throw new ValidationError('Username must be between 2 and 100 characters');
  }

  // Validate password
  if (!isStrongPassword(password)) {
    throw new ValidationError(
      'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character'
    );
  }

  // Check password confirmation
  if (password !== passwordConfirm) {
    throw new ValidationError('Passwords do not match');
  }

  // Check if user already exists
  logger.debug('Registration attempt', { email });
  const exists = await userExists(email);

  if (exists) {
    logger.warn('Registration failed - email already registered', { email });
    throw new ValidationError('Email already registered');
  }

  // Create user
  const newUser = await createUser(email, password, username);

  // Generate JWT token
  const token = jwt.sign(
    {
      id: newUser.id,
      email: newUser.email
    },
    process.env.JWT_SECRET || 'your-secret-key-change-this',
    {
      expiresIn: '24h',
      issuer: 'auth-service',
      subject: newUser.id.toString()
    }
  );

  logger.info('New user registered', {
    userId: newUser.id,
    email: newUser.email,
    username: newUser.username
  });

  // Return response
  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username
    }
  });
}
