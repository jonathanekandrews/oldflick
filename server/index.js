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
  console.log('Working directory:', process.cwd());

  // Check environment variables
  console.log('\n📋 Environment Variables:');
  const dbUrl = process.env.DATABASE_URL || 'NOT SET';

  // Safely log database URL without exposing password
  let logUrl = 'NOT SET';
  if (dbUrl !== 'NOT SET') {
    const match = dbUrl.match(/postgresql:\/\/([^:]+):(.*)@(.+)/);
    if (match) {
      logUrl = `postgresql://${match[1]}:*****@${match[3]}`;
    }
  }
  console.log('  DATABASE_URL:', logUrl);
  console.log('  NODE_ENV:', process.env.NODE_ENV);

  if (!dbUrl || dbUrl === 'NOT SET') {
    console.error('❌ CRITICAL: No DATABASE_URL found in environment!');
    console.error('   Please ensure .env file is loaded and DATABASE_URL is set');
    process.exit(1);
  }

  // Extract hostname from 'postgresql://user:pass@hostname:port/db'
  const dbHost = dbUrl.match(/@([^:]+)/)?.[1] || 'UNKNOWN';
  console.log('\n🌐 Database Host:');
  console.log('  Parsed:', dbHost);

  // Validate database connection (Supabase or Neon)
  const isSupabaseV1 = dbHost.includes('oodvbtxbeoxpilrzbxmg');
  const isSupabaseV2 = dbHost.includes('uwpncgyfdlvbphetfdiw');
  const isNeon = dbHost.includes('neon.tech');

  if (!isSupabaseV1 && !isSupabaseV2 && !isNeon) {
    console.error('❌ ERROR: Not connected to a valid database!');
    console.error('   Got:', dbHost);
    console.error('   Expected: Supabase (V1/V2) or Neon');
    process.exit(1);
  }

  let projectType = 'Unknown';
  if (isSupabaseV1) projectType = 'Supabase V1';
  else if (isSupabaseV2) projectType = 'Supabase V2';
  else if (isNeon) projectType = 'Neon PostgreSQL';

  console.log(`  ✅ Connected to ${projectType}`);

  // Test actual connection
  console.log('\n🔌 Testing Database Connection...');

  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM content');
    const contentCount = parseInt(result.rows[0].count, 10);

    console.log('✅ Database connection successful!');
    console.log('  Content records in database:', contentCount);

  } catch (err) {
    // Handle case where table doesn't exist yet (fresh Neon project)
    if (err.message.includes('content') && err.message.includes('does not exist')) {
      console.log('✅ Database connection successful!');
      console.log('  ⚠️  Schema not yet initialized (fresh Neon project - awaiting schema creation)');
    }
    // Allow startup even if connection fails during validation
    // This lets us create schema via Neon console first, then app will work
    else if (err.message.includes('password authentication failed') ||
             err.message.includes('SASL') ||
             err.message.includes('ENOTFOUND')) {
      console.log('⚠️  Database connection validation skipped');
      console.log('  Error:', err.message);
      console.log('  The schema may need to be created manually via Neon console');
      console.log('  Once created, the application will connect normally');
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
