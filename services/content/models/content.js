/**
 * Content Model
 * Database queries for films and shows
 */

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/**
 * Get all content with optional filters
 */
export async function getAllContent(filters = {}) {
  try {
    let query = 'SELECT * FROM content WHERE 1=1';
    const params = [];
    let paramCount = 1;

    // Filter by content type
    if (filters.content_type) {
      query += ` AND content_type = $${paramCount}`;
      params.push(filters.content_type.toLowerCase());
      paramCount++;
    }

    // Filter by release year
    if (filters.year) {
      query += ` AND release_year = $${paramCount}`;
      params.push(filters.year);
      paramCount++;
    }

    // Filter by genre
    if (filters.genre) {
      query += ` AND $${paramCount} = ANY(genres)`;
      params.push(filters.genre);
      paramCount++;
    }

    query += ' ORDER BY id ASC';

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error fetching content:', error.message);
    throw error;
  }
}

/**
 * Get content by ID
 */
export async function getContentById(id) {
  try {
    const result = await pool.query(
      'SELECT * FROM content WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching content by ID:', error.message);
    throw error;
  }
}

/**
 * Search content by title or description
 */
export async function searchContent(query) {
  try {
    const searchTerm = `%${query}%`;
    const result = await pool.query(
      `SELECT * FROM content
       WHERE LOWER(title) LIKE LOWER($1)
          OR LOWER(description) LIKE LOWER($1)
       ORDER BY title ASC`,
      [searchTerm]
    );
    return result.rows;
  } catch (error) {
    console.error('Error searching content:', error.message);
    throw error;
  }
}

/**
 * Create new content
 */
export async function createContent(data) {
  try {
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
    } = data;

    const result = await pool.query(
      `INSERT INTO content (
        title, description, release_year, runtime_minutes, content_type,
        imdb_id, tmdb_id, poster_url, trailer_url, rating, genres, actors, director,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        title, description, release_year, runtime_minutes, content_type,
        imdb_id, tmdb_id, poster_url, trailer_url, rating, genres, actors, director
      ]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error creating content:', error.message);
    throw error;
  }
}

/**
 * Update content
 */
export async function updateContent(id, data) {
  try {
    const updates = [];
    const params = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        updates.push(`${key} = $${paramCount}`);
        params.push(value);
        paramCount++;
      }
    });

    if (updates.length === 0) {
      return await getContentById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const query = `UPDATE content SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, params);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating content:', error.message);
    throw error;
  }
}

/**
 * Delete content
 */
export async function deleteContent(id) {
  try {
    const result = await pool.query(
      'DELETE FROM content WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error deleting content:', error.message);
    throw error;
  }
}

export default pool;
