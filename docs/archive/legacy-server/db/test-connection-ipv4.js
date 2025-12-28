import 'dotenv/config';
import pg from 'pg';
import dns from 'dns';

const { Pool } = pg;

console.log('\n=== SUPABASE DATABASE CONNECTION TEST (IPv4 ONLY) ===\n');

// Force IPv4 only
dns.setDefaultResultOrder('ipv4first');

console.log('📋 Configuration:');
console.log(`   HOST: ${process.env.DATABASE_URL?.split('@')[1]?.split(':')[0] || 'NOT SET'}`);
console.log(`   PORT: ${process.env.DATABASE_URL?.split(':')?.pop()?.split('/')[0] || 'NOT SET'}`);
console.log(`   DNS Order: IPv4 first`);

if (!process.env.DATABASE_URL) {
  console.error('\n❌ ERROR: DATABASE_URL not set');
  process.exit(1);
}

// Create pool with IPv4-only DNS
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 10000
});

console.log('\n🔄 Attempting connection with IPv4-only DNS...\n');

pool.query('SELECT NOW()', async (err, res) => {
  if (err) {
    console.error('❌ CONNECTION FAILED:');
    console.error(`   Code: ${err.code}`);
    console.error(`   Message: ${err.message}`);
  } else {
    console.log('✅ CONNECTION SUCCESSFUL!');
    console.log(`   Server time: ${res.rows[0].now}`);
  }

  await pool.end();
  process.exit(err ? 1 : 0);
});

setTimeout(() => {
  console.error('\n⏱️  CONNECTION TIMEOUT');
  pool.end();
  process.exit(1);
}, 15000);
