/**
 * API Gateway Routes
 * Routes requests to appropriate microservices
 */

import express from 'express';
import fetch from 'node-fetch';
import { serviceRegistry, circuitBreakers } from './index.js';
import { createLogger } from '../services/shared/utils/logger.js';
import { APIError } from '../services/shared/middleware/errorHandler.js';

const router = express.Router();
const logger = createLogger('gateway-router');

/**
 * Service proxy function with circuit breaker
 */
async function proxyRequest(serviceName, method, path, body, headers) {
  const circuitBreaker = circuitBreakers[serviceName];

  if (!circuitBreaker) {
    throw new APIError(
      `Unknown service: ${serviceName}`,
      400
    );
  }

  return circuitBreaker.execute(async () => {
    const serviceUrl = serviceRegistry[serviceName];
    const url = `${serviceUrl}${path}`;

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.error?.message || `${serviceName} service error`,
        response.status,
        { service: serviceName, originalStatus: response.status }
      );
    }

    return response.json();
  });
}

/**
 * Authentication Service Routes
 * POST /api/auth/login
 * POST /api/auth/register
 * POST /api/auth/logout
 * GET /api/auth/me
 */
router.post('/api/auth/login', async (req, res, next) => {
  try {
    const data = await proxyRequest('auth', 'POST', '/login', req.body, {
      'X-Forwarded-For': req.ip
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post('/api/auth/register', async (req, res, next) => {
  try {
    const data = await proxyRequest('auth', 'POST', '/register', req.body, {
      'X-Forwarded-For': req.ip
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post('/api/auth/logout', async (req, res, next) => {
  try {
    const data = await proxyRequest('auth', 'POST', '/logout', req.body, {
      'Authorization': req.headers.authorization
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/api/auth/me', async (req, res, next) => {
  try {
    const data = await proxyRequest('auth', 'GET', '/me', null, {
      'Authorization': req.headers.authorization
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * Content Service Routes
 * GET /api/content
 * GET /api/content/:id
 * GET /api/content/search
 * POST /api/content (admin)
 * PUT /api/content/:id (admin)
 * DELETE /api/content/:id (admin)
 */
router.get('/api/content', async (req, res, next) => {
  try {
    const queryString = new URLSearchParams(req.query).toString();
    const path = '/list' + (queryString ? `?${queryString}` : '');
    const data = await proxyRequest('content', 'GET', path, null, {});
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/api/content/:id', async (req, res, next) => {
  try {
    const data = await proxyRequest('content', 'GET', `/${req.params.id}`, null, {});
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/api/content/search', async (req, res, next) => {
  try {
    const queryString = new URLSearchParams(req.query).toString();
    const path = '/search' + (queryString ? `?${queryString}` : '');
    const data = await proxyRequest('content', 'GET', path, null, {});
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post('/api/content', async (req, res, next) => {
  try {
    const data = await proxyRequest('content', 'POST', '/', req.body, {
      'Authorization': req.headers.authorization
    });
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

router.put('/api/content/:id', async (req, res, next) => {
  try {
    const data = await proxyRequest('content', 'PUT', `/${req.params.id}`, req.body, {
      'Authorization': req.headers.authorization
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.delete('/api/content/:id', async (req, res, next) => {
  try {
    const data = await proxyRequest('content', 'DELETE', `/${req.params.id}`, null, {
      'Authorization': req.headers.authorization
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * User Service Routes
 * GET /api/users/profile
 * PUT /api/users/profile
 * GET /api/users/watchlist
 * POST /api/users/watchlist/:id
 * DELETE /api/users/watchlist/:id
 */
router.get('/api/users/profile', async (req, res, next) => {
  try {
    const data = await proxyRequest('users', 'GET', '/profile', null, {
      'Authorization': req.headers.authorization
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.put('/api/users/profile', async (req, res, next) => {
  try {
    const data = await proxyRequest('users', 'PUT', '/profile', req.body, {
      'Authorization': req.headers.authorization
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/api/users/watchlist', async (req, res, next) => {
  try {
    const data = await proxyRequest('users', 'GET', '/watchlist', null, {
      'Authorization': req.headers.authorization
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post('/api/users/watchlist/:id', async (req, res, next) => {
  try {
    const data = await proxyRequest('users', 'POST', `/watchlist/${req.params.id}`, req.body, {
      'Authorization': req.headers.authorization
    });
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

router.delete('/api/users/watchlist/:id', async (req, res, next) => {
  try {
    await proxyRequest('users', 'DELETE', `/watchlist/${req.params.id}`, null, {
      'Authorization': req.headers.authorization
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * Media Service Routes
 * GET /api/media/:id/stream
 * POST /api/media/:id/playback
 */
router.get('/api/media/:id/stream', async (req, res, next) => {
  try {
    const data = await proxyRequest('media', 'GET', `/${req.params.id}/stream`, null, {
      'Authorization': req.headers.authorization
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post('/api/media/:id/playback', async (req, res, next) => {
  try {
    const data = await proxyRequest('media', 'POST', `/${req.params.id}/playback`, req.body, {
      'Authorization': req.headers.authorization
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * Admin Service Routes (require auth)
 * GET /api/admin/users
 * POST /api/admin/content
 */
router.get('/api/admin/users', async (req, res, next) => {
  try {
    const data = await proxyRequest('admin', 'GET', '/users', null, {
      'Authorization': req.headers.authorization
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post('/api/admin/content', async (req, res, next) => {
  try {
    const data = await proxyRequest('admin', 'POST', '/content', req.body, {
      'Authorization': req.headers.authorization
    });
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
