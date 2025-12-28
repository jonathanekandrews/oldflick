import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('\n=== PARSING TV SHOW URLS FROM EXCEL ===\n');

// Read the Excel file
const excelPath = path.join(__dirname, '../../attached_assets/oldflick_tv_shows_08.12.25_1765213628341.xlsx');

try {
  const workbook = xlsx.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert to JSON
  const data = xlsx.utils.sheet_to_json(worksheet);

  console.log(`📊 Found ${data.length} rows in Excel file\n`);

  // Display the data structure
  if (data.length > 0) {
    console.log('📋 Column headers:');
    console.log(Object.keys(data[0]));
    console.log('\n📝 Sample data (first row):');
    console.log(data[0]);
    console.log('\n');

    // Display all TV shows with their URLs
    console.log('📺 TV SHOWS WITH URLS:\n');
    data.forEach((row, index) => {
      console.log(`${index + 1}. ${row['Title'] || row['title'] || 'Unknown'}`);
      const keys = Object.keys(row);
      keys.forEach(key => {
        if (key.toLowerCase().includes('url') || key.toLowerCase().includes('link')) {
          console.log(`   ${key}: ${row[key]}`);
        }
      });
      console.log('');
    });
  }

  process.exit(0);
} catch (error) {
  console.error('❌ Error parsing Excel file:');
  console.error(error.message);
  process.exit(1);
}
