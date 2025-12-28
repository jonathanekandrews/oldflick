/**
 * Auth Service (Port 3001) - Simplified Version
 */

import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.AUTH_PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'auth',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Placeholder routes
app.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint - implementation pending' });
});

app.post('/register', (req, res) => {
  res.json({ message: 'Register endpoint - implementation pending' });
});

app.get('/me', (req, res) => {
  res.json({ message: 'Me endpoint - implementation pending' });
});

app.post('/logout', (req, res) => {
  res.json({ message: 'Logout endpoint - implementation pending' });
});

app.post('/verify-token', (req, res) => {
  res.json({ message: 'Verify token endpoint - implementation pending' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: { message: 'Route not found', statusCode: 404 }
  });
});

// Simple error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    error: { message: 'Internal server error', statusCode: 500 }
  });
});

// Start server
const server = app.listen(port, () => {
  console.log(`[${new Date().toISOString()}] Auth Service started on port ${port}`);
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
