#!/usr/bin/env node

import { Client } from 'pg';

const connectionString = 'postgresql://neondb_owner:@ep-still-bread-abslny2n-pooler.eu-west-2.aws.neon.tech/neondb';

async function testConnection() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Attempting to connect to Neon...');
    console.log('Connection string:', connectionString.replace(/password[^@]*/, 'password:***'));
    console.log('');

    await client.connect();
    console.log('✅ Connection successful!');

    const result = await client.query('SELECT version();');
    console.log('PostgreSQL version:', result.rows[0].version);

    // Check tables
    const tableResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('Tables in database:', tableResult.rows.map(r => r.table_name).join(', '));

    await client.end();
    console.log('\n✅ All tests passed!');

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testConnection();
