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
    const result = await pool.query('SELECT id, title, poster_url FROM content;');
    console.log('Current posters in database:\n');
    result.rows.forEach(row => {
      console.log(`ID: ${row.id}`);
      console.log(`Title: ${row.title}`);
      console.log(`URL: ${row.poster_url || 'NO URL'}`);
      console.log('---');
    });

    console.log(`\nTotal content items: ${result.rows.length}`);
    await pool.end();
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
