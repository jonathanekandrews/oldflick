/**
 * Auth Service (Port 3001)
 * Manages user authentication, registration, and JWT tokens
 */

import express from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const port = process.env.AUTH_PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Database pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'auth',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// POST /register - Register new user
app.post('/register', async (req, res) => {
  try {
    const { email, password, passwordConfirm, username } = req.body;

    // Validate input
    if (!email || !password || !username) {
      return res.status(400).json({
        error: 'Email, password, and username required'
      });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({
        error: 'Passwords do not match'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, username) VALUES ($1, $2, $3) RETURNING id, email, username',
      [email, hashedPassword, username]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Register error:', error.message);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /login - User login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password required'
      });
    }

    // Get user
    const result = await pool.query(
      'SELECT id, email, username, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Check password
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /me - Get current user
app.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    const result = await pool.query(
      'SELECT id, email, username FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Me error:', error.message);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// POST /logout - User logout (stateless, no action needed)
app.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully', success: true });
});

// POST /verify-token - Verify JWT token
app.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, userId: decoded.id });
  } catch (error) {
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res) => {
  console.error('Error:', err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
const server = app.listen(port, () => {
  console.log(`[${new Date().toISOString()}] Auth Service started on port ${port}`);
  console.log('Endpoints:');
  console.log('  POST /login - User login');
  console.log('  POST /register - User registration');
  console.log('  GET /me - Get current user');
  console.log('  POST /logout - User logout');
  console.log('  POST /verify-token - Verify JWT token');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...');
  server.close(() => process.exit(0));
});
