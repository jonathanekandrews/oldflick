#!/usr/bin/env node

import { Client } from 'pg';

const NEON_URL = 'postgresql://neondb_owner:npg_hbcOI5gWiqAO@ep-still-bread-abslny2n-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require';

const schema = `
-- ===== USERS TABLE =====
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  subscription_status VARCHAR(50) DEFAULT 'free',
  subscription_start_date TIMESTAMP,
  subscription_end_date TIMESTAMP,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  free_trial_used BOOLEAN DEFAULT FALSE,
  watch_history JSONB,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== CONTENT TABLE =====
CREATE TABLE IF NOT EXISTS content (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content_type VARCHAR(50),
  genre VARCHAR(100),
  release_year INTEGER,
  rating DECIMAL(3, 1),
  runtime_minutes INTEGER,
  poster_url VARCHAR(500),
  director VARCHAR(255),
  actors TEXT,
  plot_summary TEXT,
  video_url VARCHAR(500),
  available BOOLEAN DEFAULT TRUE,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== USER LISTS TABLE =====
CREATE TABLE IF NOT EXISTS user_lists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, content_id)
);

-- ===== INDEXES =====
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_content_genre ON content(genre);
CREATE INDEX IF NOT EXISTS idx_content_type ON content(content_type);
CREATE INDEX IF NOT EXISTS idx_user_lists_user_id ON user_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lists_content_id ON user_lists(content_id);
`;

async function createSchema() {
  const client = new Client({
    connectionString: NEON_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔗 Connecting to Neon...');
    await client.connect();
    console.log('✅ Connected to Neon\n');

    console.log('📝 Creating schema...');
    await client.query(schema);
    console.log('✅ Schema created successfully\n');

    console.log('✅ Verifying tables...');
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    const tables = result.rows.map(r => r.table_name);
    console.log(`📋 Tables created: ${tables.join(', ')}`);
    console.log(`   Total: ${tables.length} tables\n`);

    console.log('✅ Verifying indexes...');
    const indexResult = await client.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY indexname
    `);

    const indexes = indexResult.rows.map(r => r.indexname);
    console.log(`🔍 Indexes created: ${indexes.length}`);
    indexes.forEach(idx => console.log(`   └─ ${idx}`));

    console.log('\n🎉 Schema creation complete!');
    console.log('\n📌 Next steps:');
    console.log('   1. Update .env with Neon connection string');
    console.log('   2. Test backend connectivity');
    console.log('   3. Manually add content (videos and images) later');

    await client.end();

  } catch (error) {
    console.error('\n❌ Schema creation failed:', error.message);
    process.exit(1);
  }
}

createSchema();
