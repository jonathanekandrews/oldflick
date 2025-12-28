/**
 * List Controller
 * GET /list - Get all content with optional filtering
 */

import { getAllContent } from '../models/content.js';

export async function listController(req, res) {
  try {
    const { content_type, year, genre } = req.query;

    const filters = {};
    if (content_type) filters.content_type = content_type;
    if (year) filters.year = parseInt(year);
    if (genre) filters.genre = genre;

    const content = await getAllContent(filters);

    res.json({
      total: content.length,
      items: content
    });
  } catch (error) {
    console.error('List error:', error.message);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
}
