/**
 * Create Controller
 * POST / - Create new content (admin only)
 */

import { createContent } from '../models/content.js';

export async function createController(req, res) {
  try {
    // Check authorization (should be admin)
    // In a real app, verify JWT token and admin role here

    const {
      title,
      description,
      release_year,
      runtime_minutes,
      content_type,
      imdb_id,
      tmdb_id,
      poster_url,
      trailer_url,
      rating,
      genres,
      actors,
      director
    } = req.body;

    if (!title || !content_type) {
      return res.status(400).json({ error: 'Title and content_type required' });
    }

    const newContent = await createContent({
      title,
      description,
      release_year,
      runtime_minutes,
      content_type,
      imdb_id,
      tmdb_id,
      poster_url,
      trailer_url,
      rating,
      genres,
      actors,
      director
    });

    res.status(201).json(newContent);
  } catch (error) {
    console.error('Create error:', error.message);
    res.status(500).json({ error: 'Failed to create content' });
  }
}
