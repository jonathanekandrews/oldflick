import express from 'express';
import pool from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-list', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      `SELECT c.* FROM content c
       INNER JOIN user_lists ul ON c.id = ul.content_id
       WHERE ul.user_id = $1
       ORDER BY ul.added_date DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get my list error:', error);
    res.status(500).json({ error: 'Failed to get list' });
  }
});

router.post('/my-list/:contentId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const contentId = req.params.contentId;

    const contentResult = await pool.query('SELECT id FROM content WHERE id = $1', [contentId]);
    if (contentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }

    await pool.query(
      'INSERT INTO user_lists (user_id, content_id) VALUES ($1, $2) ON CONFLICT (user_id, content_id) DO NOTHING',
      [userId, contentId]
    );

    res.json({ message: 'Added to list' });
  } catch (error) {
    console.error('Add to list error:', error);
    res.status(500).json({ error: 'Failed to add to list' });
  }
});

router.delete('/my-list/:contentId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const contentId = req.params.contentId;

    await pool.query(
      'DELETE FROM user_lists WHERE user_id = $1 AND content_id = $2',
      [userId, contentId]
    );

    res.json({ message: 'Removed from list' });
  } catch (error) {
    console.error('Remove from list error:', error);
    res.status(500).json({ error: 'Failed to remove from list' });
  }
});

router.post('/watch-history/:contentId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const contentId = req.params.contentId;

    const userResult = await pool.query('SELECT watch_history FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];
    let watchHistory = user.watch_history || [];

    if (!watchHistory.includes(parseInt(contentId))) {
      watchHistory.push(parseInt(contentId));
      
      if (watchHistory.length > 50) {
        watchHistory = watchHistory.slice(-50);
      }

      await pool.query(
        'UPDATE users SET watch_history = $1, updated_date = CURRENT_TIMESTAMP WHERE id = $2',
        [JSON.stringify(watchHistory), userId]
      );
    }

    res.json({ message: 'Added to watch history' });
  } catch (error) {
    console.error('Add to watch history error:', error);
    res.status(500).json({ error: 'Failed to add to watch history' });
  }
});

export default router;
