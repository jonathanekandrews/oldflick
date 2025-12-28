/**
 * Auth Service Routes
 *
 * POST /login - User login
 * POST /register - User registration
 * POST /logout - User logout
 * GET /me - Get current user
 * POST /verify-token - Verify token validity
 */

import express from 'express';
import { loginController } from './controllers/loginController.js';
import { registerController } from './controllers/registerController.js';
import { logoutController } from './controllers/logoutController.js';
import { meController } from './controllers/meController.js';
import { verifyTokenController } from './controllers/verifyTokenController.js';
import { asyncHandler } from '../shared/middleware/errorHandler.js';

const router = express.Router();

/**
 * POST /login
 * Public endpoint - no auth required
 */
router.post('/login', asyncHandler(loginController));

/**
 * POST /register
 * Public endpoint - no auth required
 */
router.post('/register', asyncHandler(registerController));

/**
 * POST /logout
 * Protected endpoint - requires Authorization header
 */
router.post('/logout', asyncHandler(logoutController));

/**
 * GET /me
 * Protected endpoint - requires Authorization header
 * Returns current authenticated user
 */
router.get('/me', asyncHandler(meController));

/**
 * POST /verify-token
 * Protected endpoint - used by other services to verify tokens
 */
router.post('/verify-token', asyncHandler(verifyTokenController));

export default router;
