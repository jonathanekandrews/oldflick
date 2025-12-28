import express from 'express';
import pool from '../db/connection.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
  getContentTableColumns,
  createFieldMapper,
  validateSchema,
  invalidateSchemaCache
} from '../db/schema-inspector.js';

const router = express.Router();

let fieldMapper = null;
let actualColumns = null;

// Initialize schema on first request
async function ensureSchemaLoaded() {
  if (!fieldMapper) {
    actualColumns = await getContentTableColumns();
    const validation = validateSchema(actualColumns);

    if (!validation.valid) {
      console.warn('⚠️  Schema validation warnings:');
      validation.missing.forEach(m => console.warn('   ' + m));
    }

    fieldMapper = createFieldMapper(actualColumns);
  }
}

// Debug endpoint - test raw database connection
router.get('/debug/raw-count', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM content');
    const count = result.rows[0].count;
    res.json({
      status: 'ok',
      message: 'Raw database query successful',
      contentCount: count
    });
  } catch (error) {
    console.error('❌ Debug endpoint error:', error.message);
    res.status(500).json({
      error: 'Database connection failed',
      message: error.message,
      code: error.code
    });
  }
});

router.get('/', async (req, res) => {
  try {
    await ensureSchemaLoaded();

    const { content_type, genre, featured, search } = req.query;

    let query = 'SELECT * FROM content WHERE 1=1';
    const params = [];
    let paramCount = 1;

    // Query using actual column names from schema
    if (content_type) {
      const typeCol = actualColumns['type'] ? 'type' : 'content_type';
      query += ` AND ${typeCol} = $${paramCount++}`;
      params.push(content_type);
    }

    if (genre) {
      // Genre column may exist or may be stored differently
      if (actualColumns['genre']) {
        query += ` AND genre = $${paramCount++}`;
        params.push(genre);
      }
    }

    if (featured === 'true') {
      if (actualColumns['is_featured']) {
        query += ` AND is_featured = true`;
      }
    }

    if (search) {
      query += ` AND (title ILIKE $${paramCount++} OR description ILIKE $${paramCount++})`;
      params.push(`%${search}%`, `%${search}%`);
    }

    // Order by id if created_date doesn't exist
    const orderCol = actualColumns['created_date'] ? 'created_date' : 'id';
    query += ` ORDER BY ${orderCol} DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows.map(fieldMapper));
  } catch (error) {
    console.error('❌ Get content error:', error.message);
    console.error('   Query error code:', error.code);
    console.error('   Full error:', error);
    res.status(500).json({ error: 'Failed to get content', details: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    await ensureSchemaLoaded();

    const result = await pool.query('SELECT * FROM content WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const row = result.rows[0];
    if (req.params.id === '20') {
      console.log('[CRITICAL] ID 20 RAW DATABASE ROW:', JSON.stringify({
        id: row.id,
        title: row.title,
        genre: row.genre,
        year: row.year || row.release_year,
        type: row.type || row.content_type
      }));
    }

    res.json(fieldMapper(row));
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
