import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

/**
 * Shared PostgreSQL connection pool for all microservices
 * Implements connection pooling for efficient database usage
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Connection pool settings
  max: 20,                    // Maximum connections
  idleTimeoutMillis: 30000,  // Close idle connections after 30s
  connectionTimeoutMillis: 2000, // Connection timeout
  statement_timeout: 30000,  // Query timeout
  ssl: {
    rejectUnauthorized: false // Required for Neon
  }
});

/**
 * Initialize connection pool and test connection
 */
export async function initializePool() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('[Database] Connection pool initialized successfully');
    return true;
  } catch (error) {
    console.error('[Database] Failed to initialize connection pool:', error.message);
    throw error;
  }
}

/**
 * Get a client from the pool for queries
 */
export async function getClient() {
  return pool.connect();
}

/**
 * Execute query on pool
 */
export async function query(text, params = []) {
  try {
    return await pool.query(text, params);
  } catch (error) {
    console.error('[Database] Query failed:', {
      query: text.substring(0, 50),
      params: params.length,
      error: error.message
    });
    throw error;
  }
}

/**
 * Health check for database
 */
export async function healthCheck() {
  try {
    await pool.query('SELECT 1');
    return {
      status: 'healthy',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Gracefully shutdown pool
 */
export async function shutdown() {
  try {
    await pool.end();
    console.log('[Database] Connection pool closed');
  } catch (error) {
    console.error('[Database] Error closing pool:', error.message);
    throw error;
  }
}

export default pool;
