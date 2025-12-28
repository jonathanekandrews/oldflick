/**
 * Content Service Routes
 *
 * GET /list - List all content with optional filters
 * GET /:id - Get single content by ID
 * GET /search - Search content by title/description
 * POST / - Create new content (admin)
 * PUT /:id - Update content (admin)
 * DELETE /:id - Delete content (admin)
 */

import express from 'express';
import { listController } from './controllers/listController.js';
import { getController } from './controllers/getController.js';
import { searchController } from './controllers/searchController.js';
import { createController } from './controllers/createController.js';
import { updateController } from './controllers/updateController.js';
import { deleteController } from './controllers/deleteController.js';

const router = express.Router();

// Public endpoints
router.get('/list', listController);
router.get('/search', searchController);
router.get('/:id', getController);

// Admin endpoints (TODO: add authentication middleware)
router.post('/', createController);
router.put('/:id', updateController);
router.delete('/:id', deleteController);

export default router;
