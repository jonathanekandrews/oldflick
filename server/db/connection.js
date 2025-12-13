import pg from 'pg';
import dns from 'dns';
const { Pool } = pg;

// Configure DNS to support IPv6-only Supabase hosts
// Try IPv6 first (AAAA records), then IPv4 (A records)
dns.setDefaultResultOrder('ipv6first');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  // Connection pool configuration for stability
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

pool.on('connect', () => {
  console.log('✓ Database connected');
});

export default pool;
