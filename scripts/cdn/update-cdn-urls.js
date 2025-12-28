/**
 * Update Database with Final Bunny.NET CDN URLs
 *
 * Updates all poster_url fields with the correct Bunny.NET CDN URLs
 */

import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const BUNNY_CDN_URL = process.env.BUNNY_CDN_URL_FILMS || 'https://oldflick-films-images.b-cdn.net';

// Map film IDs to their Bunny.NET filenames
const posterMap = {
  1: 'The%20Kid_Poster.jpg',      // The Kid
  2: 'The%20General_Poster.jpg',  // The General
  3: 'Metropolis_Poster_02.jpg'   // Metropolis
};

async function updateCDNUrls() {
  console.log('🎬 Updating Database with Bunny.NET CDN URLs\n');
  console.log(`CDN Base URL: ${BUNNY_CDN_URL}\n`);

  try {
    for (const [filmId, filename] of Object.entries(posterMap)) {
      const cdnUrl = `${BUNNY_CDN_URL}/${filename}`;

      const result = await pool.query(
        'UPDATE content SET poster_url = $1 WHERE id = $2 RETURNING id, title, poster_url',
        [cdnUrl, parseInt(filmId)]
      );

      if (result.rows.length > 0) {
        const row = result.rows[0];
        console.log(`✅ Film #${row.id}: ${row.title}`);
        console.log(`   URL: ${row.poster_url.substring(0, 70)}...`);
      } else {
        console.log(`⚠️  Film #${filmId} not found`);
      }
    }

    // Verify all updates
    console.log('\n📋 Final Database State:\n');
    const allPosters = await pool.query('SELECT id, title, poster_url FROM content ORDER BY id');

    allPosters.rows.forEach(row => {
      const isCDN = row.poster_url.includes('b-cdn.net');
      const icon = isCDN ? '✅' : '⚠️';
      console.log(`${icon} Film #${row.id}: ${row.title}`);
      console.log(`   ${row.poster_url}`);
    });

    console.log('\n✅ Database Update Complete!\n');
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

updateCDNUrls();
