import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db/connection.js';
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

// === DATABASE CONNECTION VALIDATOR ===
async function validateDatabaseConnection() {
  console.log('\n🔍 ===== DATABASE CONNECTION VALIDATION =====');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Process ID:', process.pid);

  // Check environment variables
  console.log('\n📋 Environment Variables:');
  const dbUrl = process.env.DATABASE_URL || 'NOT SET';
  console.log('  DATABASE_URL:', dbUrl === 'NOT SET' ? dbUrl : dbUrl.split('@')[0] + '@' + dbUrl.split('@')[1]);
  console.log('  NODE_ENV:', process.env.NODE_ENV);

  if (!dbUrl || dbUrl === 'NOT SET') {
    console.error('❌ CRITICAL: No DATABASE_URL found in environment!');
    process.exit(1);
  }

  // Extract hostname from 'postgresql://user:pass@hostname:port/db'
  const dbHost = dbUrl.match(/@([^:]+)/)?.[1] || 'UNKNOWN';
  console.log('\n🌐 Database Host:');
  console.log('  Parsed:', dbHost);

  // Validate Supabase connection (V1 or V2)
  const isV1 = dbHost.includes('oodvbtxbeoxpilrzbxmg');
  const isV2 = dbHost.includes('uwpncgyfdlvbphetfdiw');

  if (!isV1 && !isV2) {
    console.error('❌ ERROR: Not connected to a valid Oldflick Supabase project!');
    console.error('   Got:', dbHost);
    console.error('   Expected: db.oodvbtxbeoxpilrzbxmg.supabase.co (V1) or db.uwpncgyfdlvbphetfdiw.supabase.co (V2)');
    process.exit(1);
  }

  const projectVersion = isV1 ? 'V1' : 'V2';
  console.log(`  ✅ Connected to Oldflick ${projectVersion} project`);

  // Test actual connection
  console.log('\n🔌 Testing Database Connection...');

  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM content');
    const contentCount = parseInt(result.rows[0].count, 10);

    console.log('✅ Database connection successful!');
    console.log('  Content records in database:', contentCount);

  } catch (err) {
    // Handle case where table doesn't exist yet (fresh V2 project)
    if (err.message.includes('content') && err.message.includes('does not exist')) {
      console.log('✅ Database connection successful!');
      console.log('  ⚠️  Schema not yet initialized (fresh V2 project - awaiting migrations)');
    } else {
      console.error('❌ Fatal database error:', err.message);
      process.exit(1);
    }
  }

  console.log('============================================\n');
}

// Run validation on startup
validateDatabaseConnection().catch(console.error);

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
  try {
    const dbUrl = new URL(process.env.DATABASE_URL || 'postgresql://');
    console.log(`Database: postgres://${dbUrl.hostname}/postgres`);
  } catch (e) {
    console.log(`Database: ${process.env.DATABASE_URL ? 'configured' : 'NOT CONFIGURED'}`);
  }
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
