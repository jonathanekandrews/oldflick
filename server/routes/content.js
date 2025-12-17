import express from 'express';
import pool from '../db/connection.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { content_type, genre, featured, search } = req.query;

    let query = 'SELECT * FROM content WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (content_type) {
      query += ` AND content_type = $${paramCount++}`;
      params.push(content_type);
    }

    if (genre) {
      query += ` AND genre = $${paramCount++}`;
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

router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      title, description, content_type, release_year, runtime_minutes, poster_url,
      video_url, genre, rating, actors, director
    } = req.body;

    if (!title || !content_type) {
      return res.status(400).json({ error: 'Title and content_type are required' });
    }

    const result = await pool.query(
      `INSERT INTO content (
        title, description, content_type, release_year, runtime_minutes, poster_url,
        video_url, genre, rating, actors, director
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        title, description, content_type, release_year, runtime_minutes, poster_url,
        video_url, genre, rating, actors, director
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({ error: 'Failed to create content' });
  }
});

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

export default router;
