/**
 * Search Controller
 * GET /search - Search content by title or description
 */

import { searchContent } from '../models/content.js';

export async function searchController(req, res) {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const results = await searchContent(q);

    res.json({
      query: q,
      total: results.length,
      items: results
    });
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ error: 'Search failed' });
  }
}
