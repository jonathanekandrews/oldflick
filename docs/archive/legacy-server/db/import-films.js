import 'dotenv/config';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('\n=== FILMS CSV IMPORT ===\n');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function importFilms() {
  try {
    console.log('📋 Reading films_import.csv...');
    const csvPath = path.join(__dirname, '../../films_import.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');

    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(';');

    console.log(`📊 Found ${lines.length - 1} films to import\n`);

    let importedCount = 0;
    let skippedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(';');

      if (values.length < 5) {
        console.log(`⚠️  Skipping row ${i + 1}: insufficient data`);
        skippedCount++;
        continue;
      }

      const film = {
        title: values[0]?.trim() || '',
        description: values[1]?.trim() || '',
        content_type: values[2]?.trim() === 'movie' ? 'film' : 'tv',
        release_year: parseInt(values[3]) || null,
        runtime_minutes: parseInt(values[4]?.match(/\d+/)?.[0]) || null,
        poster_url: values[5]?.trim() || null,
        genre: values[8]?.trim() || 'Unknown',
        rating: parseFloat(values[10]) || null,
        cast_members: values[11]?.trim() || null,
        director: values[12]?.trim() || null,
      };

      if (!film.title) {
        skippedCount++;
        continue;
      }

      try {
        await pool.query(
          `INSERT INTO content (
            title, description, content_type, release_year, runtime_minutes,
            poster_url, genre, rating, actors, director, available
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            film.title,
            film.description,
            film.content_type,
            film.release_year,
            film.runtime_minutes,
            film.poster_url,
            film.genre,
            film.rating,
            film.cast_members,
            film.director,
            true
          ]
        );

        console.log(`✅ ${i}. ${film.title} (${film.release_year})`);
        importedCount++;
      } catch (err) {
        console.error(`❌ Error importing "${film.title}":`, err.message);
        skippedCount++;
      }
    }

    console.log(`\n📈 Import Summary:`);
    console.log(`   ✅ Successfully imported: ${importedCount} films`);
    console.log(`   ⚠️  Skipped: ${skippedCount} films`);
    console.log(`   📊 Total in database: ${importedCount + 7} films (including 7 initial)`);

    console.log('\n✨ Import complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing films:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

importFilms();
