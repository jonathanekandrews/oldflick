import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
  try {
    const res = await pool.query(`
      SELECT 
        table_name,
        string_agg(column_name, ', ' ORDER BY ordinal_position) as columns
      FROM information_schema.columns
      WHERE table_schema = 'public'
      GROUP BY table_name
      ORDER BY table_name
    `);
    
    console.log('Current Schema:');
    res.rows.forEach(row => {
      console.log(`\n${row.table_name}:`);
      console.log('  ' + row.columns);
    });
    
    console.log('\n\nContent table details:');
    const contentRes = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'content'
      ORDER BY ordinal_position
    `);
    
    contentRes.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkSchema();
