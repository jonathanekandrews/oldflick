# Supabase to Neon Migration Plan
**Date**: 2025-12-27
**Project**: Oldflick Streaming Platform
**Current Database**: Supabase PostgreSQL (V1)
**Target Database**: Neon PostgreSQL
**Estimated Duration**: 2-4 hours (including testing)

---

## EXECUTIVE SUMMARY

This document provides a complete migration strategy for moving Oldflick from Supabase to Neon. The migration involves:

- **3 Database Tables** (users, content, user_lists)
- **7 Tables Indexes** for performance optimization
- **~7 Content Records** (initial seed data)
- **User Data & Watch History** (variable, application-dependent)

**Benefits of Neon:**
- ✅ Better pricing for development environments
- ✅ Serverless architecture (auto-scaling, no fixed costs)
- ✅ Native PostgreSQL compatibility
- ✅ Better performance in some regions
- ✅ Simpler operational model

**Risks:**
- ⚠️ Data must be exported and re-imported
- ⚠️ Downtime required during migration (30-60 minutes recommended)
- ⚠️ Connection pooling configuration differs from Supabase
- ⚠️ New connection credentials required

---

## DATABASE STRUCTURE OVERVIEW

### Current Supabase Setup

```
Project: oodvbtxbeoxpilrzbxmg (Oldflick V1)
Host: db.oodvbtxbeoxpilrzbxmg.supabase.co
Database: postgres
Port: 5432
SSL: Enabled

Tables:
├── users (19 columns, authentication & subscription)
├── content (15 columns, film/TV show metadata)
└── user_lists (4 columns, user watchlist)

Indexes: 7 total (for email, Stripe ID, genre, content type, etc.)
Data Size: ~7-10 KB (seed data only, no user data yet)
```

### Target Neon Setup

```
Project: [TO BE CREATED]
Region: US (configurable)
Database: neon
Host: [TO BE ASSIGNED BY NEON]
Port: 5432
SSL: Enabled

Same structure will be replicated:
├── users (identical schema)
├── content (identical schema)
└── user_lists (identical schema)

Identical indexes will be created
```

---

## TABLE STRUCTURE DOCUMENTATION

### TABLE 1: users

**Purpose**: Store user accounts, authentication, and subscription information

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing user ID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Unique email for login |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| full_name | VARCHAR(255) | | Display name |
| role | VARCHAR(50) | DEFAULT 'user' | user/admin/superadmin |
| subscription_status | VARCHAR(50) | DEFAULT 'free' | free/trial/active |
| subscription_start_date | TIMESTAMP | | When subscription started |
| subscription_end_date | TIMESTAMP | | When subscription expires |
| stripe_customer_id | VARCHAR(255) | | Stripe customer reference |
| stripe_subscription_id | VARCHAR(255) | | Stripe subscription reference |
| free_trial_used | BOOLEAN | DEFAULT FALSE | Has user used free trial |
| watch_history | JSONB | | Serialized watch history data |
| created_date | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation date |
| updated_date | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update date |

**Indexes:**
- `idx_users_email` on (email) — For login queries
- `idx_users_stripe_customer_id` on (stripe_customer_id) — For Stripe webhook lookups

**Current Data**: Empty (no users created yet)

**Migration Strategy**: Create table, apply indexes (no data to migrate)

---

### TABLE 2: content

**Purpose**: Store film and TV show metadata

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing content ID |
| title | VARCHAR(255) | NOT NULL | Film/show title |
| description | TEXT | | Long description |
| content_type | VARCHAR(50) | | 'film' or 'tv' |
| genre | VARCHAR(100) | | Genre classification |
| release_year | INTEGER | | Year released |
| rating | DECIMAL(3,1) | | IMDb or other rating (0.0-10.0) |
| runtime_minutes | INTEGER | | Duration in minutes |
| poster_url | VARCHAR(500) | | URL to poster image |
| director | VARCHAR(255) | | Director name(s) |
| actors | TEXT | | Actor list (comma-separated or formatted) |
| plot_summary | TEXT | | Full plot description |
| video_url | VARCHAR(500) | | URL to video file |
| available | BOOLEAN | DEFAULT TRUE | Is content available for viewing |
| created_date | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date added to database |
| updated_date | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last updated |

**Indexes:**
- `idx_content_genre` on (genre) — For genre filtering
- `idx_content_type` on (content_type) — For content type filtering

**Current Data**: 7 seed records (see below)

**Seed Data Included:**

| ID | Title | Type | Genre | Year | Director | Rating |
|----|-------|------|-------|------|----------|--------|
| 1 | Metropolis | film | Science Fiction | 1927 | Fritz Lang | 8.3 |
| 2 | Bonanza | tv | Western | 1959 | David Dortort | 8.0 |
| 3 | The Adventures of Robin Hood | tv | Adventure | 1955 | Sidney Cole | 7.8 |
| 4 | Dragnet | tv | Crime Drama | 1951 | Jack Webb | 8.0 |
| 5 | Flash Gordon | tv | Science Fiction | 1954 | Unknown | 7.5 |
| 6 | The Andy Griffith Show | tv | Comedy | 1960 | Sheldon Leonard | 8.8 |
| 7 | The Roy Rogers Show | tv | Western | 1951 | Various | 7.9 |

**Migration Strategy**: Export all 7 records, re-import into Neon, apply indexes

---

### TABLE 3: user_lists

**Purpose**: Store user's "My List" (watchlist/saved content)

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing list item ID |
| user_id | INTEGER | NOT NULL, FK → users(id) | User who saved content |
| content_id | INTEGER | NOT NULL, FK → content(id) | Content that was saved |
| added_date | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | When added to list |
| | | UNIQUE(user_id, content_id) | Prevent duplicate entries |

**Indexes:**
- `idx_user_lists_user_id` on (user_id) — For listing user's items
- `idx_user_lists_content_id` on (content_id) — For counting content saves

**Cascade Behavior**:
- ON DELETE CASCADE — Deleting user or content removes related list items
- Automatically maintains referential integrity

**Current Data**: Empty (no user lists created yet)

**Migration Strategy**: Create table with cascading constraints, no data to migrate

---

## DETAILED MIGRATION STEPS

### Phase 0: Pre-Migration Preparation (15 minutes)

**Goal**: Prepare environment and verify current data state

#### Step 1: Create Neon Account and Project

1. Go to https://neon.tech
2. Sign up or log in
3. Create new project:
   - **Name**: oldflick-production
   - **Region**: Select closest to your users (default: US East)
   - **Database Name**: postgres (default is fine)
4. Note the connection string (you'll need it)

#### Step 2: Document Current Supabase State

```bash
# Export current .env for reference
cat .env > .env.backup.supabase

# Document current connection
grep DATABASE_URL .env.backup.supabase
# Output: postgresql://postgres:PASSWORD@db.oodvbtxbeoxpilrzbxmg.supabase.co:5432/postgres
```

#### Step 3: Verify Current Data Completeness

```bash
# Connect to current Supabase and export schema
# You'll do this in Phase 1

# For now, just document that you have:
# - 0 users (empty table)
# - 7 content records (seed data)
# - 0 user_lists (empty table)
```

---

### Phase 1: Data Export from Supabase (20 minutes)

**Goal**: Export all data and schema from Supabase to local SQL files

#### Step 1.1: Export Schema (Structure Only)

Since we have the schema.sql file in the repository, we can use it directly. But let's verify it's complete:

```bash
# Verify schema file exists
ls -la server/db/schema.sql

# Expected: 72 lines, including:
# - CREATE TABLE users
# - CREATE TABLE content
# - CREATE TABLE user_lists
# - CREATE INDEX statements
# - INSERT INTO content (seed data)
```

**If using Supabase GUI:**
1. Go to Supabase dashboard
2. SQL Editor
3. Run: `SELECT * FROM users;` → Export results
4. Run: `SELECT * FROM content;` → Export results
5. Run: `SELECT * FROM user_lists;` → Export results

#### Step 1.2: Export Data (Records)

**For Seed Data (Content Table):**

```bash
# Content records can be extracted from schema.sql
# Lines 60-68 contain the INSERT statement

# If you need to export from live Supabase, use psql:
psql $SUPABASE_CONNECTION_STRING -c "
  \copy content TO '/tmp/content-export.csv' WITH (FORMAT csv, HEADER);
"
```

**For User Data (if any):**

```bash
# Export users table
psql $SUPABASE_CONNECTION_STRING -c "
  \copy users TO '/tmp/users-export.csv' WITH (FORMAT csv, HEADER);
"

# Export user_lists
psql $SUPABASE_CONNECTION_STRING -c "
  \copy user_lists TO '/tmp/user_lists-export.csv' WITH (FORMAT csv, HEADER);
"
```

#### Step 1.3: Create Export Directory

```bash
mkdir -p migrations/supabase-to-neon
cd migrations/supabase-to-neon

# Copy schema
cp ../../server/db/schema.sql ./01-schema.sql

# Create data export files (empty for now, since no user data)
touch 02-users-data.sql
touch 03-content-data.sql
touch 04-user_lists-data.sql
```

---

### Phase 2: Create Neon Database and Schema (15 minutes)

**Goal**: Set up identical schema in Neon

#### Step 2.1: Get Neon Connection String

From Neon dashboard:
1. Go to your project: oldflick-production
2. Click "Connection string"
3. Copy the PostgreSQL connection string
4. Format: `postgresql://neon_user:password@neon-host.neon.tech/postgres?sslmode=require`

#### Step 2.2: Apply Schema to Neon

```bash
# Test connection first
psql "postgresql://neon_user:password@neon-host.neon.tech/postgres?sslmode=require" -c "SELECT version();"

# Expected output: PostgreSQL 16.x on ...
# If this fails, check your connection string

# Apply schema
psql "postgresql://neon_user:password@neon-host.neon.tech/postgres?sslmode=require" \
  -f server/db/schema.sql

# Expected output:
# CREATE TABLE
# CREATE TABLE
# CREATE TABLE
# CREATE INDEX
# ... (7 CREATE INDEX lines)
# INSERT 0 7
# count
# -------
# 7
# (1 row)
```

#### Step 2.3: Verify Schema Creation

```bash
# Connect to Neon and verify
psql "postgresql://neon_user:password@neon-host.neon.tech/postgres" -c "
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
  ORDER BY table_name;
"

# Expected output:
# table_name
# ----------------
# content
# user_lists
# users
# (3 rows)
```

#### Step 2.4: Verify Indexes

```bash
psql "postgresql://neon_user:password@neon-host.neon.tech/postgres" -c "
  SELECT indexname FROM pg_indexes
  WHERE schemaname = 'public'
  ORDER BY indexname;
"

# Expected output:
# idx_content_genre
# idx_content_type
# idx_user_lists_content_id
# idx_user_lists_user_id
# idx_users_email
# idx_users_stripe_customer_id
# plus 3 for primary keys
```

---

### Phase 3: Verify Data in Neon (10 minutes)

**Goal**: Confirm all data was successfully migrated

#### Step 3.1: Verify Content Records

```bash
psql "postgresql://neon_user:password@neon-host.neon.tech/postgres" -c "
  SELECT id, title, content_type, genre, release_year, director FROM content ORDER BY id;
"

# Expected output (7 rows):
# id |           title            | content_type |      genre      | release_year | director
# ----+----------------------------+--------------+-----------------+--------------+-----------
#  1 | Metropolis                 | film         | Science Fiction |         1927 | Fritz Lang
#  2 | Bonanza                    | tv           | Western         |         1959 | David Dortort
#  ... (5 more rows)
```

#### Step 3.2: Verify Tables Are Empty (As Expected)

```bash
psql "postgresql://neon_user:password@neon-host.neon.tech/postgres" -c "
  SELECT COUNT(*) FROM users;
  SELECT COUNT(*) FROM user_lists;
"

# Expected output:
# count
# -------
# 0
# (1 row)
```

#### Step 3.3: Test Foreign Key Constraints

```bash
# This should fail (referential integrity working)
psql "postgresql://neon_user:password@neon-host.neon.tech/postgres" -c "
  INSERT INTO user_lists (user_id, content_id) VALUES (9999, 9999);
"

# Expected: ERROR - violates foreign key constraint
```

---

### Phase 4: Update Application Configuration (10 minutes)

**Goal**: Point application to Neon instead of Supabase

#### Step 4.1: Update .env File

```bash
# Backup current .env
cp .env .env.backup.supabase

# Update DATABASE_URL
# OLD: postgresql://postgres:PASSWORD@db.oodvbtxbeoxpilrzbxmg.supabase.co:5432/postgres
# NEW: postgresql://neon_user:password@neon-host.neon.tech/postgres?sslmode=require

# Edit .env
nano .env  # or use your editor

# Find and replace:
# DATABASE_URL=postgresql://postgres:***@db.oodvbtxbeoxpilrzbxmg.supabase.co:5432/postgres
# DATABASE_URL=postgresql://neon_user:password@neon-host.neon.tech/postgres?sslmode=require

# Note: Keep other Supabase variables as they may be used for storage/auth
```

#### Step 4.2: Create .env.neon for Reference

```bash
# Create documented version
cat > .env.neon << 'EOF'
# Neon PostgreSQL Configuration
# Project: oldflick-production
# Region: US East

DATABASE_URL=postgresql://neon_user:password@neon-host.neon.tech/postgres?sslmode=require

# These remain unchanged (not database-related)
SUPABASE_URL=https://oodvbtxbeoxpilrzbxmg.supabase.co
SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Stripe configuration (unchanged)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
EOF
```

---

### Phase 5: Connection Configuration Update (5 minutes)

**Goal**: Ensure connection pool settings work with Neon

#### Step 5.1: Verify Connection.js

Review `server/db/connection.js`:

```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,                    // Max connections
  idleTimeoutMillis: 30000,   // 30 second idle timeout
  connectionTimeoutMillis: 10000  // 10 second connection timeout
});
```

**For Neon**: This is perfect as-is. Neon supports all these parameters.

**Optional: If you hit connection limits, use Neon's connection pooler:**

```javascript
// Alternative: Use Neon's built-in pooler
const poolerUrl = process.env.DATABASE_POOLER_URL || process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: poolerUrl,
  ssl: { rejectUnauthorized: false },
  max: 10,  // Neon recommends lower max with pooler
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});
```

#### Step 5.2: Update DNS Configuration (Optional)

Neon uses IPv4 by default (unlike Supabase which needed IPv6 config):

```javascript
// server/db/connection.js can simplify to:
// dns.setDefaultResultOrder('ipv6first');  // ← Remove this line for Neon
// Neon works fine with default DNS resolution
```

---

### Phase 6: Testing (15 minutes)

**Goal**: Verify application works with Neon

#### Step 6.1: Start Backend Server

```bash
# Kill any existing servers
pkill -f "node server"

# Reload environment
source .env  # or just restart terminal

# Start backend
npm run dev:server

# Expected output:
# 🔍 ===== DATABASE CONNECTION VALIDATION =====
# 📋 Environment Variables:
# DATABASE_URL: postgresql://neon_user:***@neon-host.neon.tech/postgres
# 🌐 Database Host:
# Parsed: neon-host.neon.tech
# ✅ Connection to Neon database successful
# Server running on port 5000
```

#### Step 6.2: Test Health Endpoint

```bash
# In another terminal
curl http://localhost:3001/api/health

# Expected response:
# {"message":"OK","database":"connected"}
```

#### Step 6.3: Test Content API

```bash
curl http://localhost:3001/api/content?content_type=film

# Expected response:
# [
#   {
#     "id": 1,
#     "title": "Metropolis",
#     "description": "A visionary German film...",
#     "content_type": "film",
#     "genre": "Science Fiction",
#     "release_year": 1927,
#     "rating": 8.3,
#     "runtime_minutes": 145,
#     "director": "Fritz Lang",
#     "poster_url": "https://images.unsplash.com/..."
#   }
# ]
```

#### Step 6.4: Start Full Application

```bash
npm run dev

# Expected:
# Backend starts on port 5000 ✅
# Frontend starts on port 5000 ✅ (served by Vite)
# Database connects to Neon ✅
# Content loads in browser ✅
```

---

### Phase 7: Verification and Cleanup (10 minutes)

**Goal**: Confirm everything works, then clean up

#### Step 7.1: Full Application Test

1. Open http://localhost:5000
2. Check that content is visible on the browse page
3. Test search functionality
4. Test filtering by genre and content type
5. Verify no console errors

#### Step 7.2: Database Verification

```bash
# Check that application created any new data (if applicable)
psql "postgresql://neon_user:password@neon-host.neon.tech/postgres" -c "
  SELECT COUNT(*) as total_content FROM content;
  SELECT COUNT(*) as total_users FROM users;
  SELECT COUNT(*) as total_saved FROM user_lists;
"

# Expected:
# total_content: 7
# total_users: 0 (unless you created users)
# total_saved: 0 (unless users saved content)
```

#### Step 7.3: Git Commit

```bash
# Commit the configuration changes
git add .env
git add server/db/connection.js  # if changed
git add .claude/settings.local.json  # if documenting

git commit -m "Migrate database from Supabase to Neon

- Update DATABASE_URL to point to Neon PostgreSQL
- Migrate users, content, and user_lists tables
- Verify all data and indexes successfully transferred
- Application tested and verified with Neon backend

Migration Plan: tasks/NEON_MIGRATION_PLAN.md
"

# Keep backups
git add .env.backup.supabase .env.neon
git commit -m "Add Supabase backup and Neon reference configurations"
```

#### Step 7.4: Archive Supabase Credentials (Optional)

```bash
# If you want to keep Supabase for future reference:
# 1. Note the old connection string in a secure location
# 2. Consider keeping IPv4 add-on active for 30 days
# 3. Then disable it to stop monthly charges

# Or permanently delete the Supabase project:
# 1. Supabase dashboard → Settings → Delete project
# 2. Requires confirmation with project name
```

---

## SQL MIGRATION SCRIPTS

### Script 1: Create Schema in Neon

**File**: `migrations/neon-setup.sql`

This is the standard `server/db/schema.sql` - no changes needed:

```sql
-- Oldflick Database Schema for Neon
-- PostgreSQL tables for users, content, and user interactions

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  subscription_status VARCHAR(50) DEFAULT 'free',
  subscription_start_date TIMESTAMP,
  subscription_end_date TIMESTAMP,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  free_trial_used BOOLEAN DEFAULT FALSE,
  watch_history JSONB,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content table
CREATE TABLE IF NOT EXISTS content (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content_type VARCHAR(50),
  genre VARCHAR(100),
  release_year INTEGER,
  rating DECIMAL(3, 1),
  runtime_minutes INTEGER,
  poster_url VARCHAR(500),
  director VARCHAR(255),
  actors TEXT,
  plot_summary TEXT,
  video_url VARCHAR(500),
  available BOOLEAN DEFAULT TRUE,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Lists table (for "My List" feature)
CREATE TABLE IF NOT EXISTS user_lists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, content_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_content_genre ON content(genre);
CREATE INDEX IF NOT EXISTS idx_content_type ON content(content_type);
CREATE INDEX IF NOT EXISTS idx_user_lists_user_id ON user_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lists_content_id ON user_lists(content_id);

-- Sample data - Classic films and TV shows
INSERT INTO content (title, description, content_type, genre, release_year, rating, runtime_minutes, director, plot_summary, poster_url)
VALUES
  ('Metropolis', 'A visionary German film exploring themes of class struggle in a futuristic city.', 'film', 'Science Fiction', 1927, 8.3, 145, 'Fritz Lang', 'In a futuristic metropolis, a rebellion threatens to destroy a carefully balanced society. A young idealist and a mad scientist uncover sinister secrets about their world.', 'https://images.unsplash.com/photo-1489599849228-13a80a36cd48?w=300&h=450&fit=crop'),
  ('Bonanza', 'An American Western television series following the Cartwright family on their ranch.', 'tv', 'Western', 1959, 8.0, 50, 'David Dortort', 'The Cartwright family—ranchers in Nevada—face various challenges including cattle rustlers, Native Americans, and personal dramas as they navigate life in the American West.', 'https://images.unsplash.com/photo-1606402437281-801fddda1a66?w=300&h=450&fit=crop'),
  ('The Adventures of Robin Hood', 'A classic TV series following the legendary outlaw Robin Hood.', 'tv', 'Adventure', 1955, 7.8, 25, 'Sidney Cole', 'Robin Hood and his band of Merry Men combat corruption and injustice in medieval England, stealing from the rich to give to the poor.', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop'),
  ('Dragnet', 'A police procedural TV series following detectives working for the LAPD.', 'tv', 'Crime Drama', 1951, 8.0, 30, 'Jack Webb', 'Detective Joe Friday and his partner tackle various crimes across Los Angeles, often working against the clock to solve serious cases.', 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=300&h=450&fit=crop'),
  ('Flash Gordon', 'A space opera TV series based on the classic comic strip.', 'tv', 'Science Fiction', 1954, 7.5, 25, 'Unknown', 'Flash Gordon, a quarterback from Earth, travels to the planet Mongo to fight the evil Ming the Merciless and his minions.', 'https://images.unsplash.com/photo-1536440936938-0b84d1dcc26d?w=300&h=450&fit=crop'),
  ('The Andy Griffith Show', 'An American sitcom about a sheriff in a small North Carolina town.', 'tv', 'Comedy', 1960, 8.8, 30, 'Sheldon Leonard', 'Sheriff Andy Taylor keeps peace in the small town of Mayberry, often dealing with quirky townspeople and relying on wisdom and humor to solve problems.', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop'),
  ('The Roy Rogers Show', 'A Western TV series featuring the singing cowboy Roy Rogers.', 'tv', 'Western', 1951, 7.9, 30, 'Various', 'Roy Rogers, known as the King of the Cowboys, along with his wife Dale Evans, fights crime in the American West with his trusty horse Trigger.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=450&fit=crop');

-- Count the inserted records
SELECT COUNT(*) as content_count FROM content;
```

---

## QUICK REFERENCE: MIGRATION CHECKLIST

```
[ ] Phase 0: Preparation
  [ ] Create Neon account
  [ ] Create Neon project (oldflick-production)
  [ ] Get Neon connection string
  [ ] Document current Supabase state

[ ] Phase 1: Data Export
  [ ] Verify schema.sql exists in repo
  [ ] Document seed data (7 content records)
  [ ] Create migrations directory

[ ] Phase 2: Create Neon Schema
  [ ] Test Neon connection
  [ ] Apply schema.sql to Neon
  [ ] Verify tables created
  [ ] Verify indexes created

[ ] Phase 3: Data Verification
  [ ] Verify 7 content records exist
  [ ] Verify users table is empty (expected)
  [ ] Verify user_lists table is empty (expected)
  [ ] Test foreign key constraints

[ ] Phase 4: Configuration
  [ ] Backup current .env
  [ ] Update DATABASE_URL to Neon
  [ ] Create .env.neon reference
  [ ] Verify other env vars unchanged

[ ] Phase 5: Connection Config
  [ ] Review server/db/connection.js
  [ ] Test with Neon connection
  [ ] Optional: Set up connection pooler

[ ] Phase 6: Testing
  [ ] Start backend server
  [ ] Test health endpoint
  [ ] Test content API endpoint
  [ ] Start full application (npm run dev)
  [ ] Verify UI loads correctly
  [ ] Test search and filtering

[ ] Phase 7: Cleanup
  [ ] Verify all data in Neon
  [ ] Git commit migration
  [ ] Archive Supabase configuration
  [ ] Optional: Disable Supabase IPv4 add-on
  [ ] Optional: Delete Supabase project

[ ] Post-Migration
  [ ] Monitor application for issues
  [ ] Check error logs
  [ ] Test user registration (if applicable)
  [ ] Test payment processing (if applicable)
  [ ] Verify all features work
```

---

## TROUBLESHOOTING GUIDE

### Issue: Connection Timeout to Neon

**Symptom**: `Error: connect ETIMEDOUT`

**Solution**:
1. Check your Neon connection string is correct
2. Verify the `.neon.tech` domain is accessible
3. Check firewall isn't blocking connections
4. Try with `sslmode=require` in connection string

### Issue: Schema Not Applying

**Symptom**: `FATAL: database "postgres" does not exist`

**Solution**:
1. Connection string should use default "postgres" database
2. Or create a new database first:
   ```sql
   CREATE DATABASE oldflick;
   ```
3. Then update connection string to use `oldflick` database

### Issue: Foreign Key Constraints Failing

**Symptom**: `violates foreign key constraint "user_lists_user_id_fkey"`

**Solution**:
1. This is expected behavior - means constraints are working
2. Don't insert user_lists records before users exist
3. Create user first, then create list item

### Issue: Content Not Showing in Application

**Symptom**: `No content available yet` or empty browse page

**Solution**:
1. Verify content records in Neon:
   ```bash
   psql -d postgresql://... -c "SELECT COUNT(*) FROM content;"
   ```
2. Check API endpoint:
   ```bash
   curl http://localhost:3001/api/content
   ```
3. Check application error logs in browser console

### Issue: Can't Connect to Neon from VS Code

**Symptom**: Connection refused when trying to use SQL client

**Solution**:
1. Use command line with psql (more reliable)
2. Or configure your SQL client to use pooler endpoint
3. Neon dashboard shows exact connection string to use

---

## NEON VS SUPABASE COMPARISON

| Feature | Supabase | Neon | Winner |
|---------|----------|------|--------|
| PostgreSQL | ✅ V1/V2 | ✅ Latest | Tie |
| Pricing | $25/mo minimum | Pay-as-you-go | Neon |
| IPv4 Support | Add-on ($4/mo) | Built-in | Neon |
| Connection Pooling | Session pooler | Built-in | Neon |
| Scaling | Fixed | Auto-scaling | Neon |
| Storage UI | Excellent | Minimal | Supabase |
| Auth UI | Excellent | N/A | Supabase |
| Support | Good | Good | Tie |
| Setup Time | 10 minutes | 5 minutes | Neon |
| Migration Effort | 45 minutes | - | N/A |

---

## POST-MIGRATION RECOMMENDATIONS

### 1. Monitor Performance
- Keep eye on query performance in first week
- Check Neon dashboard for metrics
- Adjust connection pool size if needed

### 2. Set Up Backups
- Neon offers automatic backups
- Enable backup retention policy
- Test restore procedure

### 3. Enable Monitoring
```javascript
// Optional: Add query logging
pool.on('query', (query) => {
  console.log('Query:', query.text, query.values);
});
```

### 4. Plan Supabase Decommissioning
- Keep old project for 30 days as fallback
- Then disable IPv4 add-on
- Then delete project (optional)

### 5. Update Documentation
- Update README with Neon instructions
- Document Neon dashboard access
- Add backup/restore procedures

---

## ESTIMATED COSTS

### Before Migration (Supabase)
- Dedicated IPv4: $4/month
- Base plan: Included in free tier (or $25/mo for production)
- **Total**: $4/month (or $25/mo)

### After Migration (Neon)
- Base plan: Free up to 3 projects
- Compute: $0.16/hour (auto-scales down when idle)
- Storage: $0.25/GB/month
- For small project: **~$1-3/month**

**Annual savings: $40-48** (on IPv4 alone)

---

## NEXT STEPS

1. **Create Neon Account**: Go to neon.tech, sign up
2. **Create Project**: oldflick-production in US region
3. **Get Connection String**: Copy from Neon dashboard
4. **Follow Phase 0-7 Above**: Step by step
5. **Test Thoroughly**: All features must work
6. **Commit Changes**: Document the migration
7. **Archive Supabase**: Keep or delete as desired

---

**Migration Plan prepared**: 2025-12-27
**Estimated duration**: 2-4 hours
**Downtime required**: 30-60 minutes (during testing phase)
**Rollback capability**: Yes (keep Supabase for 30 days)
**Confidence level**: HIGH - Plan is comprehensive and well-documented

