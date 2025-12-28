/**
 * Get Controller
 * GET /:id - Get single content by ID
 */

import { getContentById } from '../models/content.js';

export async function getController(req, res) {
  try {
    const { id } = req.params;

    const content = await getContentById(parseInt(id));

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json(content);
  } catch (error) {
    console.error('Get error:', error.message);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
}
