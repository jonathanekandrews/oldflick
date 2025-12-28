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
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);

    console.log('✅ Users table structure:');
    console.table(result.rows);

    // Check content table
    const contentResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'content'
      ORDER BY ordinal_position;
    `);

    console.log('\n✅ Content table structure:');
    console.table(contentResult.rows);

    await pool.end();
  } catch (e) {
    console.error('❌ Error:', e.message);
    await pool.end();
    process.exit(1);
  }
})();
