/**
 * Content Service (Port 3002)
 * Manages all films and shows - List, Get, Search, Create, Update, Delete
 */

import express from 'express';
import dotenv from 'dotenv';
import routes from './routes.js';

dotenv.config();

const app = express();
const port = process.env.CONTENT_PORT || 3002;

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
    service: 'content',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes
app.use('/', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
const server = app.listen(port, () => {
  console.log(`[${new Date().toISOString()}] Content Service started on port ${port}`);
  console.log('Endpoints:');
  console.log('  GET /list - List all content');
  console.log('  GET /search - Search content');
  console.log('  GET /:id - Get content by ID');
  console.log('  POST / - Create content (admin)');
  console.log('  PUT /:id - Update content (admin)');
  console.log('  DELETE /:id - Delete content (admin)');
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

export default app;
