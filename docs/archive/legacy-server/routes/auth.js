import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db/connection.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, full_name, role, subscription_status, created_date`,
      [email, password_hash, full_name || null]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    delete user.password_hash;

    const token = generateToken(user);
    res.json({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, role, subscription_status, subscription_start_date, subscription_end_date, stripe_customer_id, stripe_subscription_id, free_trial_used, watch_history, created_date FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { full_name, subscription_status, subscription_start_date, subscription_end_date, free_trial_used } = req.body;
    
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (full_name !== undefined) {
      updates.push(`full_name = $${paramCount++}`);
      values.push(full_name);
    }
    if (subscription_status !== undefined) {
      updates.push(`subscription_status = $${paramCount++}`);
      values.push(subscription_status);
    }
    if (subscription_start_date !== undefined) {
      updates.push(`subscription_start_date = $${paramCount++}`);
      values.push(subscription_start_date);
    }
    if (subscription_end_date !== undefined) {
      updates.push(`subscription_end_date = $${paramCount++}`);
      values.push(subscription_end_date);
    }
    if (free_trial_used !== undefined) {
      updates.push(`free_trial_used = $${paramCount++}`);
      values.push(free_trial_used);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_date = CURRENT_TIMESTAMP`);
    values.push(req.user.id);

    const query = `
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING id, email, full_name, role, subscription_status, subscription_start_date, subscription_end_date, stripe_customer_id, stripe_subscription_id, free_trial_used, created_date
    `;

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

export default router;
