# Poster Migration Guide: Unsplash → Bunny.NET CDN

**Purpose**: Step-by-step guide to migrate poster storage from Unsplash to Bunny.NET CDN
**Timeline**: 1-2 hours for 100-1000 films
**Difficulty**: Intermediate

---

## Why Migrate?

| Aspect | Unsplash | Bunny.NET |
|--------|----------|-----------|
| **Cost** | Free | $0.015/GB |
| **Control** | Limited | Full |
| **Optimization** | None | Automatic |
| **Custom Domain** | No | Yes |
| **Analytics** | No | Yes |
| **Video CDN** | No | Yes |
| **Scale** | Limited | Unlimited |

**Trigger Migration When**:
- Have 100+ films in database
- Need custom branding (your domain)
- Want image optimization
- Planning to add video streaming
- Using >1GB/month bandwidth

---

## Phase 1: Bunny.NET Setup

### Step 1: Create Bunny.NET Account

1. Go to https://bunny.net
2. Sign up for free account (includes $0.50 credit)
3. Verify email
4. Create password

### Step 2: Create Storage Zone

```
1. Dashboard → Storage
2. Click "Create Storage Zone"
3. Name: oldflick-posters (or similar)
4. Region: Choose closest to your users
5. Create

Result: Storage zone created with access credentials
```

### Step 3: Get Access Credentials

```
1. Dashboard → Storage → Your Zone
2. Tab: "Access Keys"
3. Copy:
   - Storage Zone Name: oldflick-posters
   - API Key: (long string)
   - FTP Hostname: (hostname)
4. Save in password manager or .env file
```

### Step 4: Configure in .env

```bash
# .env
BUNNY_STORAGE_ZONE=oldflick-posters
BUNNY_API_KEY=your-api-key-here
BUNNY_HOSTNAME=oldflick.bunnycdn.com  # Custom domain later
BUNNY_REGION=eu  # or us, asia-sg, etc.
```

---

## Phase 2: Upload Existing Posters

### Option A: Manual Upload (Small Catalog)

For 1-10 posters:

```
1. Dashboard → Storage → Your Zone
2. Click "Upload Files"
3. Select poster images
4. Name them: 1.jpg, 2.jpg, 3.jpg, etc.
5. Upload
6. Note the CDN URLs shown
```

**Result**: Images at `https://your-account.b-cdn.net/1.jpg`

### Option B: Script Upload (Recommended)

For 10+ posters, use this Node.js script:

```javascript
// scripts/upload-to-bunny.js
const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config();

const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE;
const BUNNY_HOSTNAME = `${BUNNY_STORAGE_ZONE}.b-cdn.net`;

/**
 * Upload file to Bunny.NET
 */
async function uploadToBunny(filename, fileBuffer) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: `storage.bunnycdn.com`,
      port: 443,
      path: `/${BUNNY_STORAGE_ZONE}/${filename}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': fileBuffer.length,
        'AccessKey': BUNNY_API_KEY
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 201 || res.statusCode === 200) {
          const cdnUrl = `https://${BUNNY_HOSTNAME}/${filename}`;
          resolve(cdnUrl);
        } else {
          reject(new Error(`Upload failed: ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.write(fileBuffer);
    req.end();
  });
}

/**
 * Main migration script
 */
async function migratePosters() {
  // Import database
  const db = require('../server/db/pool.js');

  console.log('Starting poster migration to Bunny.NET...\n');

  // Get all films with posters
  const { rows: films } = await db.query(`
    SELECT id, title, poster_url FROM content WHERE poster_url IS NOT NULL
  `);

  console.log(`Found ${films.length} films with posters\n`);

  for (const film of films) {
    try {
      // Download from current URL (Unsplash)
      console.log(`[${film.id}] Downloading ${film.title}...`);
      const imageBuffer = await downloadImage(film.poster_url);

      // Upload to Bunny.NET
      console.log(`[${film.id}] Uploading to Bunny.NET...`);
      const newUrl = await uploadToBunny(`${film.id}.jpg`, imageBuffer);

      // Update database
      console.log(`[${film.id}] Updating database...`);
      await db.query(
        `UPDATE content SET poster_url = $1 WHERE id = $2`,
        [newUrl, film.id]
      );

      console.log(`[${film.id}] ✅ Complete: ${newUrl}\n`);

    } catch (error) {
      console.error(`[${film.id}] ❌ Error: ${error.message}\n`);
    }
  }

  console.log('✅ Migration complete!');
  process.exit(0);
}

/**
 * Download image from URL
 */
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Download failed: ${response.statusCode}`));
      }

      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    });
  });
}

// Run migration
migratePosters().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});
```

### Run the Migration Script

```bash
# Install dependencies (if needed)
npm install dotenv

# Run migration
node scripts/upload-to-bunny.js

# Output:
# [1] Downloading The Kid...
# [1] Uploading to Bunny.NET...
# [1] Updating database...
# [1] ✅ Complete: https://oldflick.b-cdn.net/1.jpg
#
# [2] Downloading The General...
# ... etc
```

---

## Phase 3: Update Frontend

### No Changes Needed! ✅

The frontend already fetches poster_url from the API:

```jsx
// Already works with new CDN URLs
<img src={content.poster_url} alt={content.title} />
```

Since we're storing the full URL in the database, the frontend automatically uses the new CDN URLs without changes.

---

## Phase 4: Optimize Images

### Add Image Optimization Parameters

Update database to include optimization:

```javascript
// scripts/optimize-poster-urls.js
const db = require('../server/db/pool.js');

async function optimizePosterUrls() {
  const { rows: films } = await db.query(`
    SELECT id, poster_url FROM content WHERE poster_url IS NOT NULL
  `);

  for (const film of films) {
    // Add optimization parameters
    const optimizedUrl = film.poster_url +
      '?width=500&height=750&quality=85&format=webp';

    await db.query(
      `UPDATE content SET poster_url = $1 WHERE id = $2`,
      [optimizedUrl, film.id]
    );

    console.log(`Optimized ${film.id}: ${film.title}`);
  }

  console.log('✅ All posters optimized');
  process.exit(0);
}

optimizePosterUrls().catch(error => {
  console.error('Optimization failed:', error);
  process.exit(1);
});
```

### Optimization Parameters

```
?width=500        - Resize width
?height=750       - Resize height
?quality=85       - JPEG quality (1-100)
?format=webp      - Use modern format
?auto=format      - Auto-detect best format
?crop=smart       - Smart crop

Full example:
https://oldflick.b-cdn.net/1.jpg?width=500&height=750&quality=85&format=webp&auto=format
```

---

## Phase 5: Verify Migration

### Check Database

```bash
# Verify all URLs updated
psql $DATABASE_URL

SELECT id, title, poster_url FROM content WHERE poster_url LIKE '%unsplash%';
-- Should return: 0 rows (all migrated)

SELECT id, title, poster_url FROM content WHERE poster_url LIKE '%b-cdn.net%' OR poster_url LIKE '%bunnycdn%';
-- Should return: all films
```

### Test URLs

```bash
# Test each poster URL loads
curl -I https://oldflick.b-cdn.net/1.jpg
# HTTP/1.1 200 OK

# Check load time
curl -w "@curl-format.txt" -o /dev/null -s https://oldflick.b-cdn.net/1.jpg
# Should show <100ms load time
```

### Test in Browser

```
1. Open application at http://localhost:5000
2. Browse to Classic Films page
3. Verify posters load quickly
4. Check Network tab - should see Bunny CDN URLs
5. All posters should display correctly
```

---

## Phase 6: Monitor Performance

### Set Up Bunny.NET Analytics

```
1. Dashboard → Your Zone → Reports
2. View statistics:
   - Bandwidth used
   - Number of requests
   - Geographic distribution
   - Cache hit ratio
   - Top files
```

### Expected Metrics

```
100 films × 50 users/day × 3 views = 15,000 requests/month
  - Bandwidth: ~750MB
  - Cost: 750MB × $0.015 = $11.25/month
  - Cache hit: 95% (very high)
  - Average response time: <50ms
```

---

## Rollback Plan

If something goes wrong:

### Option 1: Revert to Unsplash URLs

```sql
-- If keeping Unsplash URLs
UPDATE content
SET poster_url = CONCAT(
  'https://images.unsplash.com/photo-',
  original_unsplash_id,
  '?w=500&h=750&fit=crop'
)
WHERE id IN (...);
```

### Option 2: Keep Both URLs

```sql
-- Keep Bunny as primary, Unsplash as fallback
ALTER TABLE content ADD COLUMN poster_url_backup VARCHAR(500);

-- Backup current URLs
UPDATE content
SET poster_url_backup = poster_url
WHERE poster_url LIKE '%unsplash%';

-- Update to Bunny URLs
UPDATE content
SET poster_url = CONCAT('https://oldflick.b-cdn.net/', id, '.jpg')
WHERE poster_url_backup IS NOT NULL;
```

---

## Cost Projection

### Monthly Costs After Migration

```
Bunny.NET Pricing:
  - Base cost: $0/month (free tier)
  - Bandwidth: 15GB × $0.015/GB = $0.23/month

OR if you add custom domain:
  - Base cost: $4.95/month
  - Bandwidth: 15GB × $0.015/GB = $0.23/month
  - Total: ~$5/month

Scale to 1000 films:
  - 1000 films × 50KB = 50MB per user
  - 1000 users/day × 3 requests = 3000 requests
  - Bandwidth: 1000 users × 3 × 50KB = 150GB/month
  - Cost: (150GB × $0.015) + $4.95 = $2.25 + $4.95 = ~$7.20/month

Massive scale (1 million users):
  - 1M users × 3 requests × 50KB = 150TB/month
  - Cost: (150TB × $0.015) + $4.95 = $2250 + $4.95 = ~$2255/month
  - Still cheap compared to serving from your own servers
```

---

## Troubleshooting

### Issue: Upload Fails with 401

```
Error: 401 Unauthorized

Solution: Check API key
  - Verify BUNNY_API_KEY is correct
  - Verify storage zone name is correct
  - Check credentials haven't expired
```

### Issue: Images Don't Display

```
Error: 404 Not Found

Solution: Check file names
  - Verify files uploaded with correct names
  - Check capitalization (e.g., 1.jpg vs 1.JPG)
  - Verify poster_url in database matches uploaded filename
```

### Issue: Slow Load Times

```
Problem: Images loading slowly

Solution:
  - Check CDN region is close to users
  - Enable image optimization (?format=webp&quality=85)
  - Verify browser cache is working (Cache-Control headers)
  - Check Bunny dashboard for cache hit ratio
```

### Issue: High Bandwidth Usage

```
Problem: Unexpected high costs

Solution:
  - Check Cache-Control headers (should be high)
  - Review analytics for unusual patterns
  - Check if bots/crawlers downloading images
  - Verify image compression is working
```

---

## Completion Checklist

- [ ] Created Bunny.NET account
- [ ] Set up storage zone
- [ ] Configured API credentials in .env
- [ ] Downloaded all current posters (or used script)
- [ ] Uploaded to Bunny.NET
- [ ] Updated database with new URLs
- [ ] Verified all URLs in database
- [ ] Tested in browser (all posters load)
- [ ] Confirmed network requests to Bunny CDN
- [ ] Set up image optimization parameters
- [ ] Configured caching headers
- [ ] Set up analytics monitoring
- [ ] Documented in POSTER_STORAGE_ANALYSIS.md
- [ ] Kept backup of old URLs (optional)
- [ ] Trained team on new process

---

## Future Enhancements

### Next Steps (When Adding Video)

```javascript
// Add video streaming alongside poster CDN
BUNNY_VIDEO_LIBRARY=oldflick-videos
BUNNY_VIDEO_COLLECTION=classic-films

// Videos and posters share same CDN = economies of scale
// Single vendor = simplified management
```

### Advanced: Custom Domain

```
1. Bunny.NET → Your Zone → Settings
2. Add custom domain: posters.oldflick.com
3. Update DNS with provided CNAME
4. Update .env: BUNNY_HOSTNAME=posters.oldflick.com
5. Update database URLs if needed

Result:
  From: https://oldflick.b-cdn.net/1.jpg
  To:   https://posters.oldflick.com/1.jpg
```

---

## Related Documents

- [Poster Storage Analysis](POSTER_STORAGE_ANALYSIS.md) - Detailed comparison
- [Film Poster Inventory](film-images/FILM_POSTER_INVENTORY.md) - Current state
- [Assets Index](ASSETS_INDEX.md) - All asset references

---

**Migration Document**: v1.0
**Created**: December 28, 2025
**Status**: Ready to Execute
**Estimated Time**: 1-2 hours for 100-1000 films
