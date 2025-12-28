/**
 * Test API Gateway - Simplified version for testing
 * Routes requests to microservices and reports status
 */

import express from 'express';
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

const app = express();
const port = process.env.GATEWAY_PORT || 3000;

// Service registry
const serviceRegistry = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  content: process.env.CONTENT_SERVICE_URL || 'http://localhost:3002',
  users: process.env.USERS_SERVICE_URL || 'http://localhost:3003',
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    registeredServices: Object.keys(serviceRegistry)
  });
});

// Proxy function
function proxyRequest(serviceName, path, method, body = null) {
  return new Promise((resolve, reject) => {
    const serviceUrl = serviceRegistry[serviceName];
    if (!serviceUrl) {
      reject(new Error(`Service ${serviceName} not registered`));
      return;
    }

    const urlObj = new URL(path, serviceUrl);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const result = await proxyRequest('auth', '/login', 'POST', req.body);
    res.status(result.statusCode).set(result.headers).send(result.body);
  } catch (error) {
    console.error('Error proxying to auth service:', error.message);
    res.status(503).json({ error: 'Auth service unavailable' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const result = await proxyRequest('auth', '/register', 'POST', req.body);
    res.status(result.statusCode).set(result.headers).send(result.body);
  } catch (error) {
    console.error('Error proxying to auth service:', error.message);
    res.status(503).json({ error: 'Auth service unavailable' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const result = await proxyRequest('auth', '/me', 'GET');
    res.status(result.statusCode).set(result.headers).send(result.body);
  } catch (error) {
    console.error('Error proxying to auth service:', error.message);
    res.status(503).json({ error: 'Auth service unavailable' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const result = await proxyRequest('auth', '/logout', 'POST', req.body);
    res.status(result.statusCode).set(result.headers).send(result.body);
  } catch (error) {
    console.error('Error proxying to auth service:', error.message);
    res.status(503).json({ error: 'Auth service unavailable' });
  }
});

app.post('/api/auth/verify-token', async (req, res) => {
  try {
    const result = await proxyRequest('auth', '/verify-token', 'POST', req.body);
    res.status(result.statusCode).set(result.headers).send(result.body);
  } catch (error) {
    console.error('Error proxying to auth service:', error.message);
    res.status(503).json({ error: 'Auth service unavailable' });
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
app.use((err, req, res, next) => {
  console.error('Gateway error:', err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
const server = app.listen(port, () => {
  console.log(`[${new Date().toISOString()}] API Gateway started on port ${port}`);
  console.log('Registered services:');
  Object.entries(serviceRegistry).forEach(([name, url]) => {
    console.log(`  - ${name}: ${url}`);
  });
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
