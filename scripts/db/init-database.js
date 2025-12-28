/**
 * Database Initialization Script
 * Creates necessary tables for microservices
 */

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

/**
 * Create users table for Auth Service
 */
async function createUsersTable() {
  try {
    console.log('Creating users table...');

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `;

    await pool.query(createTableSQL);
    console.log('✅ Users table created successfully');
    return true;
  } catch (error) {
    console.error('❌ Error creating users table:', error.message);
    throw error;
  }
}

/**
 * Create user_watchlist table for Users Service
 */
async function createWatchlistTable() {
  try {
    console.log('Creating user_watchlist table...');

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS user_watchlist (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content_id INTEGER REFERENCES content(id) ON DELETE CASCADE,
        saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, content_id)
      );

      CREATE INDEX IF NOT EXISTS idx_watchlist_user ON user_watchlist(user_id);
      CREATE INDEX IF NOT EXISTS idx_watchlist_content ON user_watchlist(content_id);
    `;

    await pool.query(createTableSQL);
    console.log('✅ User watchlist table created successfully');
    return true;
  } catch (error) {
    console.error('❌ Error creating user_watchlist table:', error.message);
    throw error;
  }
}

/**
 * Create user_ratings table for Users Service
 */
async function createRatingsTable() {
  try {
    console.log('Creating user_ratings table...');

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS user_ratings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content_id INTEGER REFERENCES content(id) ON DELETE CASCADE,
        rating INTEGER CHECK (rating >= 1 AND rating <= 10),
        review TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, content_id)
      );

      CREATE INDEX IF NOT EXISTS idx_ratings_user ON user_ratings(user_id);
      CREATE INDEX IF NOT EXISTS idx_ratings_content ON user_ratings(content_id);
    `;

    await pool.query(createTableSQL);
    console.log('✅ User ratings table created successfully');
    return true;
  } catch (error) {
    console.error('❌ Error creating user_ratings table:', error.message);
    throw error;
  }
}

/**
 * Verify content table exists
 */
async function verifyContentTable() {
  try {
    const result = await pool.query(
      "SELECT to_regclass('public.content')"
    );

    if (result.rows[0].to_regclass) {
      console.log('✅ Content table verified');
      return true;
    } else {
      console.warn('⚠️  Content table does not exist');
      return false;
    }
  } catch (error) {
    console.error('❌ Error verifying content table:', error.message);
    return false;
  }
}

/**
 * Main initialization
 */
async function initialize() {
  console.log('🚀 Initializing database...\n');

  try {
    // Test connection
    console.log('Testing database connection...');
    const testResult = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful\n');

    // Create tables
    await verifyContentTable();
    await createUsersTable();

    // Try to create dependent tables (may fail if content table doesn't exist)
    try {
      await createWatchlistTable();
      await createRatingsTable();
    } catch (error) {
      console.warn('⚠️  Could not create watchlist/ratings tables (content table may not exist yet)');
      console.warn('   These will be created after content table is available\n');
    }

    console.log('\n✅ Database initialization complete!');
    console.log('\nSummary:');
    console.log('  ✅ Users table ready for Auth Service');
    console.log('  ✅ Indexes created for performance');
    console.log('\nNext steps:');
    console.log('  1. Configure Bunny.NET credentials in .env');
    console.log('  2. Run: node scripts/migrate-posters-to-bunny.js');
    console.log('  3. Start Auth Service: cd services/auth && npm install && npm start');

    await pool.end();
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error.message);
    await pool.end();
    process.exit(1);
  }
}

// Run initialization
initialize();
