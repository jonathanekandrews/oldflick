#!/usr/bin/env node

/**
 * Poster Migration Script: Unsplash → Bunny.NET CDN
 *
 * This script downloads posters from current URLs and uploads to Bunny.NET CDN
 * Updates database with new CDN URLs
 *
 * Usage: node scripts/migrate-posters-to-bunny.js
 *
 * Requirements:
 *  - BUNNY_API_KEY in .env
 *  - BUNNY_STORAGE_ZONE in .env (e.g., "oldflick-posters")
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();
const { Pool } = pkg;

// Configuration
const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE;
const BUNNY_STORAGE_PASSWORD = process.env.BUNNY_STORAGE_PASSWORD_FILMS;
const BUNNY_BASE_URL = `https://storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}`;
const BUNNY_CDN_URL = process.env.BUNNY_CDN_URL || `https://${BUNNY_STORAGE_ZONE}.b-cdn.net`;

// Validate configuration
if (!BUNNY_API_KEY) {
  console.error('❌ Error: BUNNY_API_KEY not found in .env');
  process.exit(1);
}

if (!BUNNY_STORAGE_ZONE) {
  console.error('❌ Error: BUNNY_STORAGE_ZONE not found in .env');
  process.exit(1);
}

console.log('🚀 Poster Migration Script');
console.log('════════════════════════════════════════════════════════════\n');
console.log(`📍 Bunny.NET Storage Zone: ${BUNNY_STORAGE_ZONE}`);
console.log(`📍 CDN URL: ${BUNNY_CDN_URL}`);
console.log('════════════════════════════════════════════════════════════\n');

/**
 * Download image from URL
 */
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    console.log(`   ⬇️  Downloading from ${url.substring(0, 50)}...`);

    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      // Follow redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadImage(response.headers.location).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        return reject(new Error(`Download failed: HTTP ${response.statusCode}`));
      }

      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        console.log(`   ✅ Downloaded ${(buffer.length / 1024).toFixed(2)}KB`);
        resolve(buffer);
      });
      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Upload file to Bunny.NET
 */
function uploadToBunny(filename, fileBuffer) {
  return new Promise((resolve, reject) => {
    const url = `${BUNNY_BASE_URL}/${filename}`;

    console.log(`   ⬆️  Uploading to Bunny.NET...`);

    // Use storage zone password for authentication (Bunny.NET Storage API requires AccessKey header)
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': fileBuffer.length,
        'AccessKey': BUNNY_STORAGE_PASSWORD
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 201 || res.statusCode === 200) {
          const cdnUrl = `${BUNNY_CDN_URL}/${filename}?width=500&height=750&quality=85&format=webp`;
          console.log(`   ✅ Uploaded to CDN`);
          resolve(cdnUrl);
        } else {
          reject(new Error(`Upload failed: HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.write(fileBuffer);
    req.end();
  });
}

/**
 * Update database with new poster URL
 */
async function updateDatabase(db, contentId, newUrl) {
  console.log(`   💾 Updating database...`);

  await db.query(
    'UPDATE content SET poster_url = $1 WHERE id = $2',
    [newUrl, contentId]
  );

  console.log(`   ✅ Database updated`);
}

/**
 * Main migration function
 */
async function migratePosters() {
  // Create database connection
  let db;
  try {
    db = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
  } catch (error) {
    console.error('❌ Error: Could not create database connection');
    console.error('   Make sure DATABASE_URL is set in .env');
    process.exit(1);
  }

  try {
    // Get all films with posters
    console.log('📋 Fetching films from database...\n');
    const { rows: films } = await db.query(`
      SELECT id, title, poster_url FROM content
      WHERE poster_url IS NOT NULL
      ORDER BY id ASC
    `);

    console.log(`Found ${films.length} films with posters\n`);

    if (films.length === 0) {
      console.log('✅ No posters to migrate');
      process.exit(0);
    }

    let successCount = 0;
    let errorCount = 0;

    // Migrate each poster
    for (const film of films) {
      try {
        console.log(`\n[${film.id}/${films.length}] ${film.title}`);
        console.log('─────────────────────────────────────────────────────');

        // Skip if already migrated
        if (film.poster_url.includes('bunnycdn.com') || film.poster_url.includes('b-cdn.net')) {
          console.log('⏭️  Already migrated (Bunny URL detected), skipping\n');
          successCount++;
          continue;
        }

        console.log(`Current URL: ${film.poster_url.substring(0, 60)}...`);

        // Download from current URL
        const imageBuffer = await downloadImage(film.poster_url);

        // Upload to Bunny.NET
        const newUrl = await uploadToBunny(`${film.id}.jpg`, imageBuffer);

        // Update database
        await updateDatabase(db, film.id, newUrl);

        console.log(`New URL: ${newUrl.substring(0, 60)}...`);
        successCount++;
        console.log(`✅ Complete\n`);

      } catch (error) {
        errorCount++;
        console.error(`❌ Error: ${error.message}\n`);
      }
    }

    // Summary
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('📊 Migration Summary');
    console.log('════════════════════════════════════════════════════════════');
    console.log(`✅ Successful: ${successCount}/${films.length}`);
    console.log(`❌ Failed: ${errorCount}/${films.length}`);
    console.log(`📊 Success Rate: ${((successCount / films.length) * 100).toFixed(1)}%`);
    console.log('════════════════════════════════════════════════════════════\n');

    if (errorCount === 0) {
      console.log('🎉 Migration Complete! All posters migrated to Bunny.NET CDN\n');
    } else {
      console.log('⚠️  Some posters failed to migrate. Check the errors above.\n');
    }

    await db.end();
    process.exit(errorCount > 0 ? 1 : 0);

  } catch (error) {
    console.error('\n❌ Fatal Error:', error.message);
    console.error(error.stack);
    await db.end();
    process.exit(1);
  }
}

// Run migration
migratePosters();
