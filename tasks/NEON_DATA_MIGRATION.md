# Neon Data Migration Guide
**Project**: Oldflick Streaming Platform
**From**: Supabase PostgreSQL V1
**To**: Neon PostgreSQL
**Date**: 2025-12-27

---

## OVERVIEW

This guide covers exporting data from Supabase and importing it into Neon. The migration includes:

- **Users table**: Currently empty (no migration needed)
- **Content table**: 7 seed records (requires migration)
- **User lists table**: Currently empty (no migration needed)
- **All indexes and constraints**: Applied during schema creation

**Estimated time**: 15-20 minutes

---

## PRE-MIGRATION CHECKLIST

Before starting data migration, verify:

```
[ ] Neon project created and accessible
[ ] Neon schema created (NEON_DATABASE_SCHEMA.md applied)
[ ] Supabase project still running and accessible
[ ] .env file backed up
[ ] Network connectivity to both databases confirmed
[ ] Database credentials documented
```

---

## METHOD 1: Direct SQL Copy (Recommended)

This method is fastest for small datasets and is used when both databases are accessible.

### Step 1: Export Schema and Data from Supabase

**Option A: Using the existing schema.sql file**

Since the schema and seed data are already in `server/db/schema.sql`, we can:

```bash
# 1. Create complete migration file
cat > migrations/01-complete-schema-and-data.sql << 'EOF'
-- Oldflick Complete Schema and Seed Data for Neon
-- Run this file to set up Neon database

-- ===== CREATE TABLES =====
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

CREATE TABLE IF NOT EXISTS user_lists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, content_id)
);

-- ===== CREATE INDEXES =====
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_content_genre ON content(genre);
CREATE INDEX IF NOT EXISTS idx_content_type ON content(content_type);
CREATE INDEX IF NOT EXISTS idx_user_lists_user_id ON user_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lists_content_id ON user_lists(content_id);

-- ===== SEED DATA =====
INSERT INTO content (
  title, description, content_type, genre, release_year, rating,
  runtime_minutes, director, plot_summary, poster_url
) VALUES
  (
    'Metropolis',
    'A visionary German film exploring themes of class struggle in a futuristic city.',
    'film',
    'Science Fiction',
    1927,
    8.3,
    145,
    'Fritz Lang',
    'In a futuristic metropolis, a rebellion threatens to destroy a carefully balanced society. A young idealist and a mad scientist uncover sinister secrets about their world.',
    'https://images.unsplash.com/photo-1489599849228-13a80a36cd48?w=300&h=450&fit=crop'
  ),
  (
    'Bonanza',
    'An American Western television series following the Cartwright family on their ranch.',
    'tv',
    'Western',
    1959,
    8.0,
    50,
    'David Dortort',
    'The Cartwright family—ranchers in Nevada—face various challenges including cattle rustlers, Native Americans, and personal dramas as they navigate life in the American West.',
    'https://images.unsplash.com/photo-1606402437281-801fddda1a66?w=300&h=450&fit=crop'
  ),
  (
    'The Adventures of Robin Hood',
    'A classic TV series following the legendary outlaw Robin Hood.',
    'tv',
    'Adventure',
    1955,
    7.8,
    25,
    'Sidney Cole',
    'Robin Hood and his band of Merry Men combat corruption and injustice in medieval England, stealing from the rich to give to the poor.',
    'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop'
  ),
  (
    'Dragnet',
    'A police procedural TV series following detectives working for the LAPD.',
    'tv',
    'Crime Drama',
    1951,
    8.0,
    30,
    'Jack Webb',
    'Detective Joe Friday and his partner tackle various crimes across Los Angeles, often working against the clock to solve serious cases.',
    'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=300&h=450&fit=crop'
  ),
  (
    'Flash Gordon',
    'A space opera TV series based on the classic comic strip.',
    'tv',
    'Science Fiction',
    1954,
    7.5,
    25,
    'Unknown',
    'Flash Gordon, a quarterback from Earth, travels to the planet Mongo to fight the evil Ming the Merciless and his minions.',
    'https://images.unsplash.com/photo-1536440936938-0b84d1dcc26d?w=300&h=450&fit=crop'
  ),
  (
    'The Andy Griffith Show',
    'An American sitcom about a sheriff in a small North Carolina town.',
    'tv',
    'Comedy',
    1960,
    8.8,
    30,
    'Sheldon Leonard',
    'Sheriff Andy Taylor keeps peace in the small town of Mayberry, often dealing with quirky townspeople and relying on wisdom and humor to solve problems.',
    'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop'
  ),
  (
    'The Roy Rogers Show',
    'A Western TV series featuring the singing cowboy Roy Rogers.',
    'tv',
    'Western',
    1951,
    7.9,
    30,
    'Various',
    'Roy Rogers, known as the King of the Cowboys, along with his wife Dale Evans, fights crime in the American West with his trusty horse Trigger.',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=450&fit=crop'
  )
ON CONFLICT DO NOTHING;

-- ===== VERIFICATION =====
SELECT COUNT(*) as content_count FROM content;
EOF
```

### Step 2: Apply Migration to Neon

```bash
# Test Neon connection first
psql "postgresql://neon_user:password@neon-host.neon.tech/postgres?sslmode=require" -c "SELECT version();"

# Apply complete migration
psql "postgresql://neon_user:password@neon-host.neon.tech/postgres?sslmode=require" \
  -f migrations/01-complete-schema-and-data.sql

# Expected output:
# CREATE TABLE
# CREATE TABLE
# CREATE TABLE
# CREATE INDEX
# ... (more indexes)
# INSERT 0 7
# content_count
# -------
# 7
# (1 row)
```

---

## METHOD 2: Export CSV and Import (For Complex Migrations)

Use this method if you have user data that needs careful handling.

### Step 2.1: Export from Supabase

```bash
# Get Supabase connection string
SUPABASE_CONNECTION="postgresql://postgres:PASSWORD@db.oodvbtxbeoxpilrzbxmg.supabase.co:5432/postgres"

# Create export directory
mkdir -p migrations/exports

# Export content table
psql "$SUPABASE_CONNECTION" -c "
  \copy content TO 'migrations/exports/content.csv' WITH (FORMAT csv, HEADER, ENCODING 'UTF8')
" && echo "✓ Content exported"

# Export users table (if has data)
psql "$SUPABASE_CONNECTION" -c "
  \copy users TO 'migrations/exports/users.csv' WITH (FORMAT csv, HEADER, ENCODING 'UTF8')
" && echo "✓ Users exported"

# Export user_lists (if has data)
psql "$SUPABASE_CONNECTION" -c "
  \copy user_lists TO 'migrations/exports/user_lists.csv' WITH (FORMAT csv, HEADER, ENCODING 'UTF8')
" && echo "✓ User lists exported"

# Verify exports
ls -lh migrations/exports/
```

**Expected output:**
```
-rw-r--r--  content.csv      (5-10 KB)
-rw-r--r--  users.csv        (0 KB, empty)
-rw-r--r--  user_lists.csv   (0 KB, empty)
```

### Step 2.2: Import to Neon

```bash
NEON_CONNECTION="postgresql://neon_user:password@neon-host.neon.tech/postgres?sslmode=require"

# First create empty tables (see NEON_DATABASE_SCHEMA.md)
psql "$NEON_CONNECTION" -f server/db/schema.sql

# Import content data
psql "$NEON_CONNECTION" -c "
  \copy content (id, title, description, content_type, genre, release_year, rating, runtime_minutes, poster_url, director, actors, plot_summary, video_url, available, created_date, updated_date)
  FROM 'migrations/exports/content.csv' WITH (FORMAT csv, HEADER, ENCODING 'UTF8')
" && echo "✓ Content imported"

# Import users (if data exists)
psql "$NEON_CONNECTION" -c "
  \copy users FROM 'migrations/exports/users.csv' WITH (FORMAT csv, HEADER, ENCODING 'UTF8')
" && echo "✓ Users imported"

# Import user_lists (if data exists)
psql "$NEON_CONNECTION" -c "
  \copy user_lists FROM 'migrations/exports/user_lists.csv' WITH (FORMAT csv, HEADER, ENCODING 'UTF8')
" && echo "✓ User lists imported"
```

---

## METHOD 3: Using pg_dump and psql (Most Reliable)

This method preserves exact database structure and data.

### Step 3.1: Dump from Supabase

```bash
# Create dumps directory
mkdir -p migrations/dumps

# Full database dump
pg_dump "postgresql://postgres:PASSWORD@db.oodvbtxbeoxpilrzbxmg.supabase.co:5432/postgres" \
  --clean \
  --if-exists \
  --no-privileges \
  --no-owner \
  -t users -t content -t user_lists \
  > migrations/dumps/oldflick-data.sql

# Verify dump file
ls -lh migrations/dumps/oldflick-data.sql
wc -l migrations/dumps/oldflick-data.sql
```

**Expected**: File should be 20-50 lines (mostly INSERT statements)

### Step 3.2: Restore to Neon

```bash
# Apply dump to Neon
psql "postgresql://neon_user:password@neon-host.neon.tech/postgres?sslmode=require" \
  -f migrations/dumps/oldflick-data.sql

# Or, if you want to create tables fresh, remove CREATE TABLE statements:
# Edit the dump file and remove CREATE TABLE IF NOT EXISTS lines
# Then apply it to an already-configured Neon database
```

---

## VERIFICATION PROCEDURES

After migration, verify data integrity.

### Check 1: Row Counts

```bash
NEON_CONNECTION="postgresql://neon_user:password@neon-host.neon.tech/postgres?sslmode=require"

psql "$NEON_CONNECTION" -c "
  SELECT
    (SELECT COUNT(*) FROM users) as users_count,
    (SELECT COUNT(*) FROM content) as content_count,
    (SELECT COUNT(*) FROM user_lists) as user_lists_count;
"

# Expected:
# users_count | content_count | user_lists_count
# ----+-------+----
# 0           | 7             | 0
```

### Check 2: Content Records

```bash
psql "$NEON_CONNECTION" -c "
  SELECT id, title, content_type, genre, release_year
  FROM content
  ORDER BY id
  LIMIT 7;
"

# Expected (7 rows):
# id | title            | content_type | genre           | release_year
# ---+------------------+--------------+-----------------+----
# 1  | Metropolis       | film         | Science Fiction | 1927
# 2  | Bonanza          | tv           | Western         | 1959
# 3  | The Adventures..| tv           | Adventure       | 1955
# 4  | Dragnet          | tv           | Crime Drama     | 1951
# 5  | Flash Gordon     | tv           | Science Fiction | 1954
# 6  | The Andy Griffith| tv           | Comedy          | 1960
# 7  | The Roy Rogers..| tv           | Western         | 1951
```

### Check 3: Indexes

```bash
psql "$NEON_CONNECTION" -c "
  SELECT indexname FROM pg_indexes
  WHERE schemaname = 'public'
  ORDER BY indexname;
"

# Expected (7+ indexes):
# idx_content_genre
# idx_content_type
# idx_user_lists_content_id
# idx_user_lists_user_id
# idx_users_email
# idx_users_stripe_customer_id
# (plus 3 primary key indexes)
```

### Check 4: Foreign Key Constraints

```bash
# This should FAIL (testing referential integrity)
psql "$NEON_CONNECTION" -c "
  INSERT INTO user_lists (user_id, content_id) VALUES (999, 999);
"

# Expected error:
# ERROR:  insert or update on table "user_lists" violates foreign key constraint
```

### Check 5: Unique Constraints

```bash
# This should FAIL (duplicate email)
psql "$NEON_CONNECTION" -c "
  INSERT INTO users (email, password_hash) VALUES ('test@example.com', 'hash1');
  INSERT INTO users (email, password_hash) VALUES ('test@example.com', 'hash2');
"

# Expected error on second insert:
# ERROR:  duplicate key value violates unique constraint
```

---

## DATA QUALITY CHECKS

Run these queries to ensure data integrity:

### Check for Null Content Titles

```bash
psql "$NEON_CONNECTION" -c "
  SELECT id FROM content WHERE title IS NULL;
"

# Expected: No rows
```

### Check for Invalid Ratings

```bash
psql "$NEON_CONNECTION" -c "
  SELECT id, title, rating FROM content WHERE rating < 0 OR rating > 10;
"

# Expected: No rows
```

### Check for Invalid Content Types

```bash
psql "$NEON_CONNECTION" -c "
  SELECT DISTINCT content_type FROM content;
"

# Expected: Only 'film' and 'tv'
```

### Check for Orphaned User Lists

```bash
psql "$NEON_CONNECTION" -c "
  SELECT ul.* FROM user_lists ul
  LEFT JOIN users u ON ul.user_id = u.id
  LEFT JOIN content c ON ul.content_id = c.id
  WHERE u.id IS NULL OR c.id IS NULL;
"

# Expected: No rows (since user_lists is empty)
```

---

## ROLLBACK PROCEDURES

If migration fails, you have several options:

### Option 1: Re-run Migration

```bash
# Delete all data from Neon tables
psql "$NEON_CONNECTION" -c "
  DELETE FROM user_lists;
  DELETE FROM users;
  DELETE FROM content;
"

# Re-run migration using one of the methods above
```

### Option 2: Use Supabase as Fallback

Keep Supabase running for 30 days after migration:

```bash
# Update .env to point back to Supabase
DATABASE_URL=postgresql://postgres:PASSWORD@db.oodvbtxbeoxpilrzbxmg.supabase.co:5432/postgres

# Restart application
npm run dev:server
```

### Option 3: Drop and Recreate Neon Database

If migration is severely corrupted:

```bash
# In Neon dashboard: Delete project
# Create new project
# Re-apply migration
```

---

## HANDLING USER DATA (If Applicable)

If users have been created, follow these steps:

### Exporting User Data with Password Hashes

```bash
# Export only essential user data (keep passwords secure)
psql "$SUPABASE_CONNECTION" -c "
  \copy (
    SELECT id, email, password_hash, full_name, role, subscription_status,
           subscription_start_date, subscription_end_date,
           stripe_customer_id, stripe_subscription_id, free_trial_used,
           created_date, updated_date
    FROM users
    WHERE password_hash IS NOT NULL
  ) TO 'migrations/exports/users-sensitive.csv'
  WITH (FORMAT csv, HEADER);
" && echo "✓ User data exported"

# IMPORTANT: Keep this file secure!
chmod 600 migrations/exports/users-sensitive.csv
```

### Importing User Data

```bash
# Disable foreign key checks temporarily (user_lists might reference users)
psql "$NEON_CONNECTION" -c "
  SET session_replication_role = 'replica';

  \copy users (id, email, password_hash, full_name, role, subscription_status,
               subscription_start_date, subscription_end_date,
               stripe_customer_id, stripe_subscription_id, free_trial_used,
               created_date, updated_date)
  FROM 'migrations/exports/users-sensitive.csv'
  WITH (FORMAT csv, HEADER);

  SET session_replication_role = 'origin';
" && echo "✓ User data imported"
```

### Handling Watch History JSON

```bash
# Watch history is stored as JSONB in users table
# The JSON format should be:
# [
#   { "content_id": 1, "timestamp": "2025-12-20T18:30:00Z", "progress": 0.45 },
#   { "content_id": 2, "timestamp": "2025-12-21T20:15:00Z", "progress": 1.0 }
# ]

# When exporting/importing, ensure JSON is properly escaped
# Use --no-owner and --no-privileges flags
```

---

## MIGRATION CHECKLIST

```
Before Migration
[ ] Supabase project accessible
[ ] Neon project created
[ ] New .env file ready
[ ] Backup of current .env created

Export Phase
[ ] Export schema.sql
[ ] Export users table (if has data)
[ ] Export content table
[ ] Export user_lists table (if has data)
[ ] Verify export files created

Neon Setup
[ ] Create Neon project
[ ] Get Neon connection string
[ ] Test Neon connection
[ ] Create schema in Neon
[ ] Verify empty tables

Import Phase
[ ] Import schema and data to Neon
[ ] Verify row counts match
[ ] Verify indexes created
[ ] Verify foreign keys working

Verification
[ ] Content records correct (7 items)
[ ] No null required fields
[ ] Valid data types
[ ] Constraints enforced
[ ] Indexes present

Configuration
[ ] Update .env with Neon connection
[ ] Update server/db/connection.js if needed
[ ] Test backend with new database
[ ] Test API endpoints

Testing
[ ] Backend starts without errors
[ ] Health endpoint returns OK
[ ] Content API returns 7 records
[ ] Frontend loads and displays content
[ ] No console errors

Finalization
[ ] Git commit migration
[ ] Document any issues
[ ] Archive Supabase credentials
[ ] Monitor for 24 hours
```

---

## TROUBLESHOOTING

### Connection Refused

```
ERROR: could not connect to server
```

**Solution**: Check Neon connection string is correct and contains `?sslmode=require`

### SSL Errors

```
ERROR: SSL SYSCALL error: unexpected EOF while reading
```

**Solution**: Add `?sslmode=require` to connection string, or remove IPv6 config

### Encoding Errors

```
ERROR: invalid byte sequence for encoding "UTF8"
```

**Solution**: Use `ENCODING 'UTF8'` in COPY statements

### Duplicate Key Errors

```
ERROR: duplicate key value violates unique constraint
```

**Solution**: Tables already have data. Clear with `DELETE FROM table_name;` first

### Foreign Key Violations

```
ERROR: insert or update on table violates foreign key constraint
```

**Solution**: Ensure parent records exist before inserting child records

---

## PERFORMANCE NOTES

After migration, indexes should be analyzed:

```bash
psql "$NEON_CONNECTION" -c "
  ANALYZE users;
  ANALYZE content;
  ANALYZE user_lists;
"

# Then view statistics
psql "$NEON_CONNECTION" -c "
  SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY tablename;
"
```

---

## NEXT STEPS

After successful data migration:

1. **Update Configuration** → Point to Neon in .env
2. **Test Application** → Verify all features work
3. **Monitor Performance** → Check logs for 24 hours
4. **Archive Supabase** → Keep for 30 days as fallback
5. **Document Outcome** → Note any issues encountered

---

**Migration guide version**: 1.0 (2025-12-27)
**Last tested**: 2025-12-27
**Compatible with**: PostgreSQL 12+, Neon, Supabase V1/V2

