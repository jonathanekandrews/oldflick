import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function updateContentType() {
  try {
    const result = await pool.query(
      "UPDATE content SET content_type = 'film' WHERE content_type = 'movie' RETURNING id, title, content_type"
    );
    console.log('Updated rows:');
    result.rows.forEach(r => console.log(`  ${r.id}: ${r.title} -> ${r.content_type}`));
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

updateContentType();
