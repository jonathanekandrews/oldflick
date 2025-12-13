import 'dotenv/config';
import xlsx from 'xlsx';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('\n=== UPDATING TV SHOW URLS FROM EXCEL ===\n');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Read the Excel file
const excelPath = path.join(__dirname, '../../attached_assets/oldflick_tv_shows_08.12.25_1765213628341.xlsx');

async function updateTVUrls() {
  try {
    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    console.log(`📊 Found ${data.length} rows in Excel file\n`);

    // Mapping of Excel titles to database titles (case-insensitive)
    const titleMapping = {
      'adventures of robin hood': 'The Adventures of Robin Hood',
      'andy griffith show': 'The Andy Griffith Show',
      'bonanza': 'Bonanza',
      'dragnet': 'Dragnet',
      'flash gordon': 'Flash Gordon',
      'gumby show': 'The Gumby Show',
      'roy rogers show': 'Roy Rogers Show', // May need adjustment
      'the beverly hillbillies': 'The Beverley Hillbillies',
      'the lonely ranger': 'The Lone Ranger',
      'the lucy show': 'The Lucy Show', // This one might not be in DB
      'the lone ranger': 'The Lone Ranger',
      'the twilight zone': 'The Twilight Zone',
      'the gumby show': 'The Gumby Show'
    };

    let updatedCount = 0;
    let skippedCount = 0;

    console.log('🔄 Processing TV shows...\n');

    for (const row of data) {
      const excelTitle = row['TITLE'] || '';
      const videoUrl = row['VIDEO URL'] || '';
      const imageUrl = row['IMAGE URL'] || '';

      if (!excelTitle || !videoUrl) {
        console.log(`⚠️  Skipping row: missing TITLE or VIDEO URL`);
        skippedCount++;
        continue;
      }

      // Find matching database title
      const normalizedExcelTitle = excelTitle.toLowerCase().trim();
      let dbTitle = null;

      // Direct mapping
      if (titleMapping[normalizedExcelTitle]) {
        dbTitle = titleMapping[normalizedExcelTitle];
      } else {
        // Fuzzy match - find a similar title in the DB
        const result = await pool.query(
          `SELECT title FROM content WHERE content_type = $1 ORDER BY title`,
          ['tv']
        );

        const dbTitles = result.rows.map(r => r.title);
        // Try to find a partial match
        for (const title of dbTitles) {
          if (title.toLowerCase().includes(normalizedExcelTitle) ||
              normalizedExcelTitle.includes(title.toLowerCase())) {
            dbTitle = title;
            break;
          }
        }
      }

      if (!dbTitle) {
        console.log(`⚠️  Skipping "${excelTitle}": No matching show in database`);
        skippedCount++;
        continue;
      }

      // Update the database
      try {
        const updateResult = await pool.query(
          `UPDATE content
           SET video_url = $1, poster_url = $2
           WHERE LOWER(title) = LOWER($3) AND content_type = $4`,
          [videoUrl, imageUrl, dbTitle, 'tv']
        );

        if (updateResult.rowCount > 0) {
          console.log(`✅ Updated: ${dbTitle}`);
          console.log(`   📹 Video: ${videoUrl}`);
          console.log(`   🖼️  Poster: ${imageUrl}`);
          updatedCount++;
        } else {
          console.log(`⚠️  No match found for: ${dbTitle}`);
          skippedCount++;
        }
      } catch (err) {
        console.error(`❌ Error updating "${dbTitle}":`, err.message);
        skippedCount++;
      }

      console.log('');
    }

    console.log(`\n📈 UPDATE SUMMARY:`);
    console.log(`   ✅ Updated: ${updatedCount} TV shows`);
    console.log(`   ⚠️  Skipped: ${skippedCount} rows`);
    console.log(`\n✨ URL update complete!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating TV URLs:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

updateTVUrls();
