import 'dotenv/config';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('\n=== DATABASE INITIALIZATION ===\n');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initializeDatabase() {
  try {
    console.log('📋 Reading schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('🔄 Executing schema...\n');
    const result = await pool.query(schema);

    console.log('✅ Database schema created successfully!');
    console.log('\n📊 Tables and indexes created:');
    console.log('   - users');
    console.log('   - content');
    console.log('   - user_lists');
    console.log('   - indexes for performance');
    console.log('\n🎬 Sample content loaded:');
    console.log('   - Metropolis (1927)');
    console.log('   - Bonanza (TV)');
    console.log('   - The Adventures of Robin Hood (TV)');
    console.log('   - Dragnet (TV)');
    console.log('   - Flash Gordon (TV)');
    console.log('   - The Andy Griffith Show (TV)');
    console.log('   - The Roy Rogers Show (TV)');

    // Query to show what was created
    const contentCount = await pool.query('SELECT COUNT(*) as count FROM content');
    console.log(`\n📈 Total content items: ${contentCount.rows[0].count}`);

    console.log('\n✨ Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:');
    console.error(error.message);
    if (error.detail) console.error('Detail:', error.detail);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initializeDatabase();
