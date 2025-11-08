const express = require('express');
const pool = require('../db/connection');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all content (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { type, genre, featured, search } = req.query;
    
    let query = 'SELECT * FROM content WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (type) {
      query += ` AND type = $${paramCount++}`;
      params.push(type);
    }

    if (genre) {
      query += ` AND $${paramCount++} = ANY(genre)`;
      params.push(genre);
    }

    if (featured === 'true') {
      query += ` AND is_featured = true`;
    }

    if (search) {
      query += ` AND (title ILIKE $${paramCount++} OR description ILIKE $${paramCount++})`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_date DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ error: 'Failed to get content' });
  }
});

// Get single content by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM content WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ error: 'Failed to get content' });
  }
});

// Create content (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      title, description, type, year, duration, thumbnail_url, backdrop_url,
      video_url, trailer_url, genre, rating, imdb_rating, cast_members, director,
      is_featured, is_masterpiece, is_cult
    } = req.body;

    if (!title || !type) {
      return res.status(400).json({ error: 'Title and type are required' });
    }

    const result = await pool.query(
      `INSERT INTO content (
        title, description, type, year, duration, thumbnail_url, backdrop_url,
        video_url, trailer_url, genre, rating, imdb_rating, cast_members, director,
        is_featured, is_masterpiece, is_cult
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        title, description, type, year, duration, thumbnail_url, backdrop_url,
        video_url, trailer_url, genre, rating, imdb_rating, cast_members, director,
        is_featured || false, is_masterpiece || false, is_cult || false
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({ error: 'Failed to create content' });
  }
});

// Update content (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    values.push(id);

    const query = `UPDATE content SET ${setClause}, updated_date = CURRENT_TIMESTAMP WHERE id = $${values.length} RETURNING *`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ error: 'Failed to update content' });
  }
});

// Delete content (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM content WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

module.exports = router;
