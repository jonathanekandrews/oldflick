/**
 * User Model
 *
 * Database operations for user authentication
 */

import { query } from '../../shared/db/pool.js';
import bcrypt from 'bcryptjs';
import { createLogger } from '../../shared/utils/logger.js';

const logger = createLogger('auth-model');

/**
 * Get user by email
 */
export async function getUserByEmail(email) {
  try {
    const result = await query(
      'SELECT id, email, password_hash, username, created_at, updated_at FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    return result.rows[0] || null;
  } catch (error) {
    logger.error('Failed to get user by email', { email, error: error.message });
    throw error;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId) {
  try {
    const result = await query(
      'SELECT id, email, username, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );

    return result.rows[0] || null;
  } catch (error) {
    logger.error('Failed to get user by ID', { userId, error: error.message });
    throw error;
  }
}

/**
 * Create new user
 */
export async function createUser(email, password, username) {
  try {
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const result = await query(
      `INSERT INTO users (email, password_hash, username, created_at, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, email, username, created_at`,
      [email.toLowerCase(), passwordHash, username]
    );

    logger.info('User created', { userId: result.rows[0].id, email });
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') {
      // Unique constraint violation
      logger.warn('User email already exists', { email });
      const err = new Error('Email already registered');
      err.statusCode = 409;
      throw err;
    }

    logger.error('Failed to create user', { email, error: error.message });
    throw error;
  }
}

/**
 * Verify password
 */
export async function verifyPassword(plainPassword, passwordHash) {
  try {
    return await bcrypt.compare(plainPassword, passwordHash);
  } catch (error) {
    logger.error('Failed to verify password', { error: error.message });
    throw error;
  }
}

/**
 * Update last login (optional - depends on schema)
 */
export async function updateLastLogin(userId) {
  try {
    // Try to update last_login if column exists
    await query(
      'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    );

    logger.debug('Updated user timestamp', { userId });
  } catch (error) {
    logger.warn('Failed to update user timestamp', { userId, error: error.message });
    // Don't throw - this is not critical
  }
}

/**
 * Check if user exists
 */
export async function userExists(email) {
  try {
    const result = await query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1',
      [email]
    );

    return result.rows.length > 0;
  } catch (error) {
    logger.error('Failed to check user existence', { email, error: error.message });
    throw error;
  }
}
