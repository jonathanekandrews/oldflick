import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import contentRoutes from './routes/content.js';
import stripeRoutes from './routes/stripe.js';
import userRoutes from './routes/user.js';
import articlesRoutes from './routes/articles.js';
import { getContentTableColumns, validateSchema } from './db/schema-inspector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.NODE_ENV === 'production' ? 5000 : (process.env.API_PORT || 3001);
const isDev = process.env.NODE_ENV !== 'production';

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://oldflick.com', 'https://staging.oldflick.com', 'https://www.oldflick.com']
    : true,
  credentials: true
}));

app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/user', userRoutes);
app.use('/api/articles', articlesRoutes);

app.get('/api/health', async (req, res) => {
  try {
    const actualColumns = await getContentTableColumns();
    const validation = validateSchema(actualColumns);

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        schema: validation
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: {
        connected: false
      }
    });
  }
});

// Schema validation endpoint (for deployments)
app.get('/api/schema-check', async (req, res) => {
  try {
    const actualColumns = await getContentTableColumns();
    const validation = validateSchema(actualColumns);

    if (validation.valid) {
      res.json(validation);
    } else {
      res.status(400).json(validation);
    }
  } catch (error) {
    res.status(500).json({
      valid: false,
      error: error.message,
      message: 'Failed to validate schema'
    });
  }
});

if (true) {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../dist/index.html'));
    } else {
      next();
    }
  });
}

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database: ${process.env.PGDATABASE}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Mode: ${isDev ? 'Development (use Vite for frontend)' : 'Production (serving static files)'}`);
});

// Keep the server process alive
server.keepAliveTimeout = 65000;
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
