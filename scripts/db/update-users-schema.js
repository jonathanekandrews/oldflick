import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    console.log('🔄 Updating users table schema...\n');

    // Add missing columns if they don't exist
    const statements = [
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255)`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user'`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP`,
      `CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email))`,
      `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`
    ];

    for (const sql of statements) {
      try {
        await pool.query(sql);
      } catch (error) {
        // Ignore if constraint already exists
        if (!error.message.includes('already exists')) {
          throw error;
        }
      }
    }
    console.log('✅ Users table schema updated successfully');

    // Verify the schema
    const verifyResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 Updated Users table structure:');
    console.table(verifyResult.rows.map(row => ({
      'Column': row.column_name,
      'Type': row.data_type,
      'Nullable': row.is_nullable,
      'Default': row.column_default || 'None'
    })));

    console.log('\n✅ Database schema is ready for Auth Service!');
    console.log('\nNext steps:');
    console.log('  1. Configure Bunny.NET credentials in .env');
    console.log('  2. Run: node scripts/migrate-posters-to-bunny.js');
    console.log('  3. Start Auth Service: cd services/auth && npm install && npm start');

    await pool.end();
  } catch (error) {
    console.error('❌ Error updating schema:', error.message);
    await pool.end();
    process.exit(1);
  }
})();
