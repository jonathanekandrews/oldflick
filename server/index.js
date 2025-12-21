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

  const dbHost = dbUrl.match(/\/@([^:]+)/)?.[1] || dbUrl.match(/\/\/([^:]+)/)?.[1] || 'UNKNOWN';
  console.log('\n🌐 Database Host:');
  console.log('  Parsed:', dbHost);
  console.log('  Expected: db.oodvbtxbeoxpilrzbxmg.supabase.co');

  if (!dbHost.includes('oodvbtxbeoxpilrzbxmg')) {
    console.error('❌ ERROR: Connected to WRONG database host!');
    console.error('   Got:', dbHost);
    console.error('   Expected: oodvbtxbeoxpilrzbxmg.supabase.co');
    process.exit(1);
  }
  console.log('  ✅ Correct database host');

  // Test actual connection and query ID 20
  console.log('\n🔌 Testing Database Connection with query for ID 20...');

  try {
    const result = await pool.query('SELECT id, title, genre, type FROM content WHERE id = 20 LIMIT 1');

    if (result.rows.length === 0) {
      console.error('❌ No record found for ID 20!');
      process.exit(1);
    }

    const row = result.rows[0];
    console.log('✅ Database connection successful!');
    console.log('\n📊 Test Query Result (ID 20):');
    console.log('  ID:', row.id);
    console.log('  Title:', row.title);
    console.log('  Genre:', row.genre);
    console.log('  Type:', row.type || 'not set');

    // Critical validation
    const expectedTitle = 'The Adventures of Robin Hood';
    if (row.title !== expectedTitle) {
      console.error('\n❌ ❌ ❌ DATABASE MISMATCH DETECTED! ❌ ❌ ❌');
      console.error('Expected title:', expectedTitle);
      console.error('Got title:', row.title);
      console.error('This indicates the app is connected to the WRONG database or data is corrupted!');
      console.error('=================================================\n');
    } else {
      console.log('  ✅ Data matches expected database (Robin Hood is correct)');
    }

  } catch (err) {
    console.error('❌ Fatal database error:', err.message);
    process.exit(1);
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
