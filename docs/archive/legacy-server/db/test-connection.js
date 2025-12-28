import 'dotenv/config';
import pg from 'pg';
import dns from 'dns';

const { Pool } = pg;

// Fix IPv6 resolution for Supabase
dns.setDefaultResultOrder('ipv6first');

console.log('\n=== SUPABASE DATABASE CONNECTION TEST ===\n');

// Display configuration
console.log('📋 Configuration:');
console.log(`   HOST: ${process.env.DATABASE_URL?.split('@')[1]?.split(':')[0] || 'NOT SET'}`);
console.log(`   PORT: ${process.env.DATABASE_URL?.split(':')?.pop()?.split('/')[0] || 'NOT SET'}`);
console.log(`   USER: ${process.env.DATABASE_URL?.split('://')?.pop()?.split(':')[0] || 'NOT SET'}`);
console.log(`   DATABASE: ${process.env.DATABASE_URL?.split('/')?.pop() || 'NOT SET'}`);

if (!process.env.DATABASE_URL) {
  console.error('\n❌ ERROR: DATABASE_URL not set in environment variables');
  process.exit(1);
}

// Create pool with SSL disabled for now (to match server config)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 10000
});

// Test connection
console.log('\n🔄 Attempting connection...\n');

pool.query('SELECT NOW()', async (err, res) => {
  if (err) {
    console.error('❌ CONNECTION FAILED:');
    console.error(`   Code: ${err.code}`);
    console.error(`   Message: ${err.message}`);
    console.error(`   Errno: ${err.errno}`);

    // Additional diagnostics
    if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
      console.error('\n📌 Possible causes:');
      console.error('   1. DNS resolution failure (ENOTFOUND)');
      console.error('   2. Network connectivity issue');
      console.error('   3. Firewall blocking port 5432');
      console.error('   4. Supabase project paused or offline');
      console.error('   5. IPv6/IPv4 mismatch');
    }

    if (err.code === 'ECONNREFUSED') {
      console.error('   → Connection refused: port 5432 not listening');
    }
  } else {
    console.log('✅ CONNECTION SUCCESSFUL!');
    console.log(`   Server time: ${res.rows[0].now}`);
  }

  // End pool
  await pool.end();
  process.exit(err ? 1 : 0);
});

// Timeout after 15 seconds
setTimeout(() => {
  console.error('\n⏱️  CONNECTION TIMEOUT: No response after 10 seconds');
  console.error('   → Server may be unreachable or very slow');
  pool.end();
  process.exit(1);
}, 15000);
