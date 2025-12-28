# Poster Storage Strategy: In-Memory vs. Database vs. CDN

**Purpose**: Compare storage approaches for film/show poster images
**Date**: December 28, 2025
**Audience**: Architects, Backend Developers, DevOps

---

## Executive Summary

| Storage Method | Best For | Cost | Performance | Scalability |
|---|---|---|---|---|
| **Database (BLOB)** | Small catalogs (<100 items) | Low | Slow | Limited |
| **Server Memory** | ❌ NOT RECOMMENDED | ❌ Bad | Fast | ❌ Bad |
| **Local File System** | Development/Testing | Low | Good | Limited |
| **External CDN** | Production (RECOMMENDED) | Medium | Excellent | Unlimited |

**Recommendation**: **External CDN (Unsplash/Bunny.NET)** for production, **Database URLs** for simplicity

---

## Option 1: Database Storage (BLOB)

### How It Works
Store binary image data directly in PostgreSQL as BLOB (Binary Large Object):

```sql
CREATE TABLE poster_images (
  id SERIAL PRIMARY KEY,
  content_id INTEGER REFERENCES content(id),
  image_data BYTEA,  -- Binary data
  mime_type VARCHAR(50),
  file_size INTEGER,
  created_at TIMESTAMP
);

-- Insert image
INSERT INTO poster_images (content_id, image_data, mime_type)
VALUES (1, decode(image_hex, 'hex'), 'image/jpeg');

-- Retrieve image
SELECT image_data FROM poster_images WHERE content_id = 1;
```

### Advantages ✅
- **Atomic transactions**: Image and metadata together
- **Backup included**: Database backups include images
- **No external dependencies**: Everything in one system
- **Access control**: Can use database permissions
- **ACID compliance**: Guaranteed consistency
- **Simple relationships**: Direct FK to content

### Disadvantages ❌
- **Large database size**: Images bloat database (1000 films × 50KB = 50MB+)
- **Slow retrieval**: Network I/O and database processing overhead
- **Memory intensive**: Large queries load entire images into RAM
- **Backup complexity**: Huge backups, slow restore times
- **Poor caching**: Can't cache efficiently at CDN level
- **Replication issues**: Slower replication/failover with image data
- **Limited scaling**: Database becomes bottleneck
- **No optimization**: Can't optimize images per client

### Performance Impact

```
Database size: 100 films × 50KB = ~5MB
  - Uncompressed backup: ~5MB
  - With other data: ~50-100MB overhead

Query performance:
  SELECT * FROM content WHERE id = 1
  - Without image: 1ms
  - With BLOB: 15-30ms (network + disk I/O)

Memory usage (per request):
  - 1 user: 50KB × 5 images = 250KB
  - 100 concurrent users: 25MB RAM just for images
```

### Implementation Example

```javascript
// Backend: Serve BLOB from database
app.get('/api/content/:id', async (req, res) => {
  const { rows } = await db.query(
    `SELECT content_id, image_data, mime_type
     FROM poster_images WHERE content_id = $1`,
    [req.params.id]
  );

  if (!rows.length) return res.status(404).send();

  res.setHeader('Content-Type', rows[0].mime_type);
  res.send(rows[0].image_data);  // Send binary data
});
```

### Cost Calculation

```
Database storage:
  100 films × 50KB = 5MB per 100 films
  1000 films × 50KB = 500MB

Neon pricing (Free tier): Up to 3GB
  Could store ~60,000 films for free

Monthly cost: $0-50 (depending on tier)

Bandwidth: Image served from database
  Each image request = 50KB from database
  1000 requests/day × 50KB = 50GB/month
  Neon bandwidth: Included in standard tier
```

### When to Use
- ✅ Small catalogs (<100 items)
- ✅ Frequently updated images
- ✅ Images rarely accessed
- ✅ Simple deployment required
- ❌ NOT for high-traffic applications

---

## Option 2: Server Memory (NOT RECOMMENDED)

### How It Works
Cache poster images in Node.js memory when server starts:

```javascript
// NOT RECOMMENDED - Poor design pattern
const posterCache = new Map();

async function initializePosterCache() {
  const { rows } = await db.query('SELECT id, image_data FROM posters');

  for (const row of rows) {
    posterCache.set(row.id, row.image_data);
  }
}

app.get('/api/poster/:id', (req, res) => {
  const image = posterCache.get(req.params.id);
  res.send(image);
});
```

### Advantages ✅
- **Fastest possible**: O(1) lookup time
- **No network calls**: All in-memory
- **Simple code**: Direct hash map access

### Disadvantages ❌❌❌ (MANY!)

| Issue | Impact | Severity |
|-------|--------|----------|
| **Memory bloat** | 1000 films × 50KB = 50MB RAM | Critical |
| **Server restart = loss** | All posters lost on deploy | Critical |
| **No scaling** | Can't scale horizontally | Critical |
| **Stale data** | Updates don't reflect until restart | Critical |
| **Crashes RAM** | Large catalog = OOM errors | Critical |
| **No persistence** | Data lost on server failure | Critical |
| **Cache invalidation** | Hard to update individual posters | High |
| **Deployment issues** | Can't deploy during cache load | High |

### Why This Is Bad

```javascript
// Server crashes or restarts
npm stop  // All posters gone from memory

// Add new film - stale cache
INSERT INTO content... // Database updated
// But posterCache still has old data!

// Scale to 10 servers
Server 1 memory: {1: image, 2: image, ...}
Server 2 memory: {1: image, 2: image, ...}
// Each server has full copy - wastes 10x memory
// Inconsistent updates across servers
```

### Performance Reality

```
Initial load: 1000 films × 50KB
  - Load time: 5-10 seconds
  - Blocks server startup
  - If any query fails: partial data

Memory growth:
  - Each film added: +50KB
  - Never released until restart
  - Can lead to memory leaks

Scaling:
  - 10 servers × 50MB = 500MB wasted
  - Updates must replicate across all servers
  - Cache invalidation nightmare
```

### Verdict: ❌ DO NOT USE
This is an **anti-pattern**. Never use application memory for persistent data that should be cached at a different layer.

---

## Option 3: Local File System

### How It Works
Store images on server disk, serve as static files:

```
/public/posters/
  ├── 1.jpg (The Kid)
  ├── 2.jpg (The General)
  └── 3.jpg (Metropolis)

Database: poster_url = '/posters/1.jpg'
```

### Implementation

```javascript
// Serve static files
app.use(express.static('public'));

// Or explicitly
app.get('/posters/:id.jpg', (req, res) => {
  res.sendFile(`./public/posters/${req.params.id}.jpg`);
});
```

### Advantages ✅
- **Good performance**: Disk I/O + caching
- **Simple deployment**: Just copy files
- **Works offline**: No external dependencies
- **Cheap**: No CDN costs
- **Development friendly**: Easy to test locally

### Disadvantages ❌
- **Limited scalability**: Disk space on server
- **No horizontal scaling**: Each server needs copy
- **File sync issues**: Updates across servers
- **Slow remote access**: Network latency
- **No geographic distribution**: Same speed everywhere
- **Storage limits**: Server disk finite
- **Backup complexity**: Files + database separate
- **No image optimization**: Can't optimize per client
- **CORS issues**: Static files need CORS headers

### Storage Capacity

```
Server disk space: Typical 100GB SSD
Usable for posters: ~50GB (rest for app, logs, etc)
Image size: 50KB per poster
Maximum: 50GB / 50KB = ~1 million posters

Reality:
  - Development: ✅ Fine
  - 100 films: ✅ Fine
  - 1000 films: ✅ Fine (~50MB)
  - 10000 films: ⚠️ Watch disk space
  - 100000 films: ❌ Disk full
```

### Performance Example

```
Request: GET /posters/1.jpg
1. HTTP request → Node.js
2. Stat file on disk (1ms)
3. Read file into memory (5ms)
4. Send to client (10ms)
Total: ~16ms

With 1000 concurrent users:
  - Each needs 50KB in memory
  - 1000 × 50KB = 50MB RAM just for active transfers
  - Disk I/O can bottleneck
```

### When to Use
- ✅ Development and testing
- ✅ Small deployments (<1000 items)
- ✅ On-premise installations
- ✅ Offline applications
- ❌ Multi-server deployments
- ❌ Cloud scaling environments

### Implementation Considerations

```javascript
// Upload handler
app.post('/api/admin/upload-poster', async (req, res) => {
  const file = req.files.poster;
  const contentId = req.body.contentId;
  const filename = `${contentId}.jpg`;

  // Save to disk
  await file.mv(`./public/posters/${filename}`);

  // Update database
  await db.query(
    'UPDATE content SET poster_url = $1 WHERE id = $2',
    [`/posters/${filename}`, contentId]
  );

  res.json({ url: `/posters/${filename}` });
});
```

---

## Option 4: External CDN (RECOMMENDED) ✅

### How It Works
Store images on external CDN, reference by URL:

```
Database: poster_url = "https://cdn.bunnynet.com/posters/1.jpg"

Frontend:
  <img src={poster_url} />

Browser:
  1. Request image from CDN
  2. CDN serves from nearest edge location
  3. Browser caches
```

### Available CDN Options

#### A. Bunny.NET (Recommended for OldFlick)
```
Cost: $0.01-0.03 per GB (very cheap)
Performance: 50+ global edge locations
Features: Image optimization, video streaming
Setup: Upload via SFTP/API
Perfect for: Film/video streaming service

Example URL:
https://cdn.oldflick.bunnycdn.com/posters/1.jpg?width=500&height=750&quality=85
```

#### B. Cloudflare
```
Cost: $0 (free tier) to $20/month
Performance: Global CDN
Features: Image optimization, DDoS protection
Setup: CNAME pointing
Great for: Static assets, good free tier

Example URL:
https://images.oldflick.com/posters/1.jpg
```

#### C. AWS CloudFront
```
Cost: $0.085 per GB (or $1 minimum per month)
Performance: Excellent global coverage
Features: Image optimization, TLS
Setup: S3 + CloudFront distribution
Best for: Enterprise deployments

Example URL:
https://d123456.cloudfront.net/posters/1.jpg
```

#### D. Unsplash (Current - Free but Limited)
```
Cost: $0 (free)
Performance: Global CDN
Setup: Direct URL usage
Limitation: Not ideal for custom content
Current: Using for sample posters

Example URL:
https://images.unsplash.com/photo-1485846234645?w=500&h=750
```

### Advantages ✅✅✅

| Advantage | Benefit |
|-----------|---------|
| **Global distribution** | Images served from 50+ locations worldwide |
| **Automatic caching** | Browser + CDN caching = blazing fast |
| **Bandwidth savings** | Not from your servers |
| **Scalability** | Handle millions of requests |
| **Image optimization** | Auto-compression, format conversion |
| **No server storage** | Infinite scalability |
| **Offline updates** | Can update posters without server restart |
| **Geographic optimization** | Different formats per client |
| **Analytics** | CDN provides metrics |
| **DDoS protection** | CDN handles attacks |
| **Cost effective** | Cheap per GB |

### Performance Comparison

```
User in Europe requests poster:

Option 1 (Database):
  1. DNS → Europe
  2. Connection → US server (150ms latency)
  3. Database query → 20ms
  4. Send 50KB → 50ms
  Total: ~220ms

Option 3 (Local Files):
  1. DNS → Europe
  2. Connection → US server (150ms latency)
  3. Disk read → 10ms
  4. Send 50KB → 40ms
  Total: ~200ms

Option 4 (Bunny.NET CDN) ✅
  1. DNS → Europe CDN node (local)
  2. CDN has cached image (0ms)
  3. Send 50KB → 5ms
  Total: ~5ms

  (On repeat requests, browser cache = instant)
```

### Bandwidth Calculation

```
Scenario: 100,000 users/day, 3 requests each

Option 1 (Database):
  100,000 users × 3 requests × 50KB = 15GB/month
  Database bandwidth: Included (Neon)
  Cost: $0-50/month
  Server load: 300,000 requests

Option 3 (Local Files):
  100,000 users × 3 requests × 50KB = 15GB/month
  Server bandwidth: ~$1-2/GB = $15-30/month
  Server load: 300,000 requests (disk I/O)

Option 4 (Bunny.NET CDN) ✅
  100,000 users × 3 requests × 50KB = 15GB/month
  CDN cost: 15GB × $0.015 = $0.23/month
  Server load: 0 (offloaded)
  Cost: ~$0.25/month + $4.95 base = ~$5/month
```

### Implementation - Bunny.NET

```javascript
// Upload handler
const BunnyCDN = require('bunnycdn');

app.post('/api/admin/upload-poster', async (req, res) => {
  const file = req.files.poster;
  const contentId = req.body.contentId;
  const filename = `${contentId}.jpg`;

  // Upload to Bunny.NET
  const bunny = new BunnyCDN({
    apiKey: process.env.BUNNY_API_KEY,
    storageZone: 'oldflick-posters',
    hostname: 'oldflick.bunnycdn.com'
  });

  const url = await bunny.upload(filename, file.data);

  // Update database with CDN URL
  await db.query(
    'UPDATE content SET poster_url = $1 WHERE id = $2',
    [url, contentId]
  );

  res.json({ url });
});

// Frontend: Simple image tag
// <img src={content.poster_url} alt={content.title} />
// Bunny CDN handles everything - caching, optimization, delivery
```

### URL with Optimization

```
Basic URL:
https://oldflick.bunnycdn.com/posters/1.jpg

With Bunny's Image Optimization:
https://oldflick.bunnycdn.com/posters/1.jpg?width=500&height=750&quality=85&format=webp

Bunny automatically:
  - Resizes to 500x750
  - Compresses to 85% quality
  - Converts to WebP for modern browsers
  - Falls back to JPEG for old browsers
  - Caches at all edge locations
```

---

## Comparison Table

| Feature | Database BLOB | File System | Bunny CDN |
|---------|---|---|---|
| **Setup Time** | 30 min | 15 min | 1 hour |
| **Server Storage** | Takes space | Disk full risk | None |
| **Speed** | 15-30ms | 10-20ms | **3-8ms** ✅ |
| **Scalability** | To 1000s | To 10000s | **Unlimited** ✅ |
| **Global Performance** | Same everywhere | Slow international | **Fast everywhere** ✅ |
| **Cost/Month** | $0-50 | $15-30 | **$5-20** ✅ |
| **Bandwidth Cost** | Included | $1-2/GB | **$0.015/GB** ✅ |
| **Automatic Optimization** | No | No | **Yes** ✅ |
| **Updates** | Restart required | Immediate | **Immediate** ✅ |
| **Horizontal Scaling** | Hard | Very hard | **Built-in** ✅ |
| **Backup** | With DB | Separate | **Their problem** ✅ |
| **Analytics** | Manual | None | **Included** ✅ |

---

## Recommendation for OldFlick

### Current Phase (Development)
**Use**: Database URLs + Unsplash

```sql
-- Simple, no infrastructure needed
UPDATE content SET poster_url =
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&h=750'
WHERE id = 1;
```

**Why**:
- ✅ Free
- ✅ Reliable CDN (Unsplash)
- ✅ Fast delivery
- ✅ No setup required
- ✅ Current implementation working

### Production Phase (When Scaling)
**Migrate to**: Bunny.NET CDN

```javascript
// Upload script
const uploadToBunny = async (filmId, imageBuffer) => {
  const url = `https://oldflick.bunnycdn.com/posters/${filmId}.jpg`;

  await fetch(url, {
    method: 'PUT',
    headers: {
      'AccessKey': process.env.BUNNY_API_KEY
    },
    body: imageBuffer
  });

  await db.query(
    'UPDATE content SET poster_url = $1 WHERE id = $2',
    [url + '?width=500&height=750&quality=85', filmId]
  );
};
```

**Why**:
- ✅ Custom domain
- ✅ Image optimization
- ✅ Analytics
- ✅ Cheap ($5-20/month)
- ✅ Integrates with video streaming
- ✅ Scales to millions

### Migration Path

```
Phase 1 (Now): Unsplash URLs in database
  - Works perfectly for development
  - Free, reliable, no maintenance

Phase 2 (100+ films): Bunny.NET for posters only
  - Create storage zone
  - Upload all posterfiles
  - Update URLs in database
  - Takes 1-2 hours

Phase 3 (Scale): Bunny.NET for video + posters
  - Video streaming via Bunny CDN
  - Image optimization via Bunny
  - Single vendor = simpler management
  - Cost: ~$50-100/month at scale
```

---

## DO NOT DO

### ❌ Store posters in application memory
```javascript
// NEVER DO THIS
const posters = {}; // Loading into memory
require('fs').readdirSync('./posters').forEach(file => {
  posters[file] = require(`./posters/${file}`); // WRONG!
});
```

**Why**: Memory bloat, stale data, no persistence, scaling nightmare

### ❌ Store as BLOB unless absolutely required
```javascript
// Only do this for <100 items max
INSERT INTO posters (image_data) VALUES (...)
```

**Why**: Bloats database, slows backups, poor performance at scale

### ❌ Mix multiple storage systems
```javascript
// Confusing and problematic
posters in database, some on CDN, some locally
```

**Why**: Data integrity issues, maintenance nightmare

---

## SQL Schema for URL-Based Approach (RECOMMENDED)

```sql
-- Clean, efficient, scalable
CREATE TABLE content (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  director VARCHAR(255),
  release_year INTEGER,
  rating DECIMAL(3,1),
  genre TEXT,
  poster_url VARCHAR(500),  -- Just store URL
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for efficient lookups
CREATE INDEX idx_poster_url ON content(poster_url);

-- Update poster from Admin UI
UPDATE content
SET poster_url = 'https://oldflick.bunnycdn.com/posters/1.jpg?w=500&h=750'
WHERE id = 1;
```

---

## Summary: Choose Based on Use Case

| Scenario | Recommendation |
|----------|---|
| Development (now) | **Unsplash URLs in database** ✅ |
| Small production (<1000) | **Local files** with HTTP caching |
| Growing app (1000-100000) | **Migrate to Bunny.NET CDN** |
| Large scale (100000+) | **Bunny.NET + image optimization** |
| Maximum performance | **Bunny.NET + video CDN** |
| Cost-conscious | **Cloudflare free tier** |
| Enterprise | **AWS CloudFront + S3** |

---

## Implementation Checklist

### Current Setup (URL in Database)
- [x] Store poster URLs in content table
- [x] Fetch URL from API
- [x] Display in frontend

### Migration to Bunny.NET (When Ready)
- [ ] Create Bunny.NET account
- [ ] Create storage zone
- [ ] Upload all poster files
- [ ] Update poster_url values in database
- [ ] Delete Unsplash references (or keep as fallback)
- [ ] Monitor performance and costs
- [ ] Set up automatic image optimization
- [ ] Configure caching headers

---

**Conclusion**: For OldFlick, **URL-based storage (currently Unsplash, migrate to Bunny.NET)** is the optimal approach. It's scalable, performant, cost-effective, and maintains clean database design.

---

*Document Version*: 1.0
*Last Updated*: December 28, 2025
*Related Files*: `FILM_POSTER_INVENTORY.md`, `assets/ASSETS_INDEX.md`
