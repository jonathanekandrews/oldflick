# Neon Database Schema Documentation
**Project**: Oldflick Streaming Platform
**Database**: Neon PostgreSQL
**Date**: 2025-12-27

---

## COMPLETE DATABASE SCHEMA

### Overview

```
Database: postgres (default Neon database)
Tables: 3
Indexes: 7
Schema Size: ~50 KB
Data Size: ~10 KB (seed data only)
```

---

## TABLE DEFINITIONS

### 1. USERS TABLE

Stores user account information, authentication data, and subscription status.

```sql
CREATE TABLE users (
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
```

#### Column Reference

| Column | Type | Null | Default | Notes |
|--------|------|------|---------|-------|
| **id** | SERIAL | NO | Auto | Primary key, auto-incremented |
| **email** | VARCHAR(255) | NO | — | Unique, case-sensitive, indexed |
| **password_hash** | VARCHAR(255) | NO | — | Bcrypt hash (60 chars typical) |
| **full_name** | VARCHAR(255) | YES | NULL | User's display name |
| **role** | VARCHAR(50) | NO | 'user' | user \| admin \| superadmin |
| **subscription_status** | VARCHAR(50) | NO | 'free' | free \| trial \| active \| canceled |
| **subscription_start_date** | TIMESTAMP | YES | NULL | ISO 8601 format |
| **subscription_end_date** | TIMESTAMP | YES | NULL | ISO 8601 format |
| **stripe_customer_id** | VARCHAR(255) | YES | NULL | Stripe customer reference (cus_...) |
| **stripe_subscription_id** | VARCHAR(255) | YES | NULL | Stripe subscription reference (sub_...) |
| **free_trial_used** | BOOLEAN | NO | FALSE | Has user used their free trial |
| **watch_history** | JSONB | YES | NULL | JSON array of watched items with timestamps |
| **created_date** | TIMESTAMP | NO | CURRENT_TIMESTAMP | Account creation time (UTC) |
| **updated_date** | TIMESTAMP | NO | CURRENT_TIMESTAMP | Last modification time (UTC) |

#### Constraints

```sql
PRIMARY KEY (id)
UNIQUE (email)
CHECK (role IN ('user', 'admin', 'superadmin'))
CHECK (subscription_status IN ('free', 'trial', 'active', 'canceled'))
```

#### Indexes

```sql
CREATE INDEX idx_users_email ON users(email);
-- For login queries: email lookup

CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);
-- For Stripe webhook processing: customer lookup
```

#### Example Data

```json
{
  "id": 1,
  "email": "user@example.com",
  "password_hash": "$2b$10$abcdefghijklmnopqrstuvwxyz...",
  "full_name": "John Doe",
  "role": "user",
  "subscription_status": "active",
  "subscription_start_date": "2025-01-01T00:00:00Z",
  "subscription_end_date": "2026-01-01T00:00:00Z",
  "stripe_customer_id": "cus_ABC123XYZ",
  "stripe_subscription_id": "sub_ABC123XYZ",
  "free_trial_used": true,
  "watch_history": [
    { "content_id": 1, "timestamp": "2025-12-20T18:30:00Z", "progress": 0.45 },
    { "content_id": 2, "timestamp": "2025-12-21T20:15:00Z", "progress": 1.0 }
  ],
  "created_date": "2025-01-01T00:00:00Z",
  "updated_date": "2025-12-21T20:15:00Z"
}
```

---

### 2. CONTENT TABLE

Stores film and TV show metadata.

```sql
CREATE TABLE content (
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
```

#### Column Reference

| Column | Type | Null | Default | Notes |
|--------|------|------|---------|-------|
| **id** | SERIAL | NO | Auto | Primary key, auto-incremented |
| **title** | VARCHAR(255) | NO | — | Film/show name, indexed |
| **description** | TEXT | YES | NULL | Short description (1-2 sentences) |
| **content_type** | VARCHAR(50) | YES | NULL | 'film' \| 'tv', indexed |
| **genre** | VARCHAR(100) | YES | NULL | Genre classification (e.g., "Science Fiction"), indexed |
| **release_year** | INTEGER | YES | NULL | Year released (e.g., 1927) |
| **rating** | DECIMAL(3,1) | YES | NULL | IMDb rating or custom (0.0-10.0) |
| **runtime_minutes** | INTEGER | YES | NULL | Duration in minutes |
| **poster_url** | VARCHAR(500) | YES | NULL | URL to poster image |
| **director** | VARCHAR(255) | YES | NULL | Director name(s) |
| **actors** | TEXT | YES | NULL | Cast list (comma-separated) |
| **plot_summary** | TEXT | YES | NULL | Full plot description |
| **video_url** | VARCHAR(500) | YES | NULL | URL to video file (can be multiple formats) |
| **available** | BOOLEAN | NO | TRUE | Is content available for viewing |
| **created_date** | TIMESTAMP | NO | CURRENT_TIMESTAMP | Date added to database (UTC) |
| **updated_date** | TIMESTAMP | NO | CURRENT_TIMESTAMP | Last update date (UTC) |

#### Constraints

```sql
PRIMARY KEY (id)
CHECK (content_type IN ('film', 'tv') OR content_type IS NULL)
CHECK (rating >= 0 AND rating <= 10 OR rating IS NULL)
CHECK (runtime_minutes > 0 OR runtime_minutes IS NULL)
```

#### Indexes

```sql
CREATE INDEX idx_content_type ON content(content_type);
-- For filtering by film vs TV

CREATE INDEX idx_content_genre ON content(genre);
-- For genre-based filtering
```

#### Seed Data (7 Records)

| ID | Title | Type | Genre | Year | Director | Rating |
|----|-------|------|-------|------|----------|--------|
| 1 | Metropolis | film | Science Fiction | 1927 | Fritz Lang | 8.3 |
| 2 | Bonanza | tv | Western | 1959 | David Dortort | 8.0 |
| 3 | The Adventures of Robin Hood | tv | Adventure | 1955 | Sidney Cole | 7.8 |
| 4 | Dragnet | tv | Crime Drama | 1951 | Jack Webb | 8.0 |
| 5 | Flash Gordon | tv | Science Fiction | 1954 | Unknown | 7.5 |
| 6 | The Andy Griffith Show | tv | Comedy | 1960 | Sheldon Leonard | 8.8 |
| 7 | The Roy Rogers Show | tv | Western | 1951 | Various | 7.9 |

#### Example Data (as JSON)

```json
{
  "id": 1,
  "title": "Metropolis",
  "description": "A visionary German film exploring themes of class struggle in a futuristic city.",
  "content_type": "film",
  "genre": "Science Fiction",
  "release_year": 1927,
  "rating": 8.3,
  "runtime_minutes": 145,
  "poster_url": "https://images.unsplash.com/photo-1489599849228-13a80a36cd48?w=300&h=450&fit=crop",
  "director": "Fritz Lang",
  "actors": "Alfred Abel, Brigitte Helm, Rudolf Klein-Rogge",
  "plot_summary": "In a futuristic metropolis, a rebellion threatens to destroy a carefully balanced society. A young idealist and a mad scientist uncover sinister secrets about their world.",
  "video_url": "https://streaming.example.com/metropolis.mp4",
  "available": true,
  "created_date": "2025-01-01T00:00:00Z",
  "updated_date": "2025-12-27T00:00:00Z"
}
```

---

### 3. USER_LISTS TABLE

Stores user's "My List" feature (watchlist/saved content).

```sql
CREATE TABLE user_lists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, content_id)
);
```

#### Column Reference

| Column | Type | Null | Default | Notes |
|--------|------|------|---------|-------|
| **id** | SERIAL | NO | Auto | Primary key, auto-incremented |
| **user_id** | INTEGER | NO | — | Foreign key → users(id), indexed |
| **content_id** | INTEGER | NO | — | Foreign key → content(id), indexed |
| **added_date** | TIMESTAMP | NO | CURRENT_TIMESTAMP | When added to list (UTC) |

#### Constraints

```sql
PRIMARY KEY (id)
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- If user is deleted, all their list items are deleted
FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE
-- If content is deleted, it's removed from all user lists
UNIQUE (user_id, content_id)
-- User can't add same content twice
```

#### Indexes

```sql
CREATE INDEX idx_user_lists_user_id ON user_lists(user_id);
-- For listing all items saved by a user

CREATE INDEX idx_user_lists_content_id ON user_lists(content_id);
-- For counting how many users saved each item
```

#### Example Data

```json
{
  "id": 1,
  "user_id": 1,
  "content_id": 2,
  "added_date": "2025-12-20T14:30:00Z"
}
```

---

## COMPLETE SCHEMA SQL

```sql
-- Oldflick Database Schema for Neon
-- PostgreSQL 14+ compatible
-- Last updated: 2025-12-27

-- ===== USERS TABLE =====
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

-- ===== CONTENT TABLE =====
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

-- ===== USER LISTS TABLE =====
CREATE TABLE IF NOT EXISTS user_lists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, content_id)
);

-- ===== INDEXES =====
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

-- Verify data loaded
SELECT COUNT(*) as total_content_records FROM content;
```

---

## COMMON QUERIES

### Get All Users

```sql
SELECT id, email, full_name, role, subscription_status, created_date
FROM users
ORDER BY created_date DESC;
```

### Get User by Email

```sql
SELECT * FROM users WHERE email = 'user@example.com';
```

### Get All Content (Paginated)

```sql
SELECT id, title, content_type, genre, release_year, rating, runtime_minutes, director
FROM content
WHERE available = TRUE
ORDER BY created_date DESC
LIMIT 10 OFFSET 0;
```

### Get Content by Type

```sql
SELECT id, title, genre, release_year, rating
FROM content
WHERE content_type = 'film' AND available = TRUE
ORDER BY release_year DESC;
```

### Get Content by Genre

```sql
SELECT id, title, content_type, release_year, rating
FROM content
WHERE genre ILIKE '%science fiction%' AND available = TRUE
ORDER BY rating DESC;
```

### Get User's Saved List

```sql
SELECT c.id, c.title, c.content_type, c.genre, c.release_year, ul.added_date
FROM user_lists ul
JOIN content c ON ul.content_id = c.id
WHERE ul.user_id = 1
ORDER BY ul.added_date DESC;
```

### Get Most Popular Content

```sql
SELECT
  c.id,
  c.title,
  c.content_type,
  COUNT(ul.id) as times_saved
FROM content c
LEFT JOIN user_lists ul ON c.id = ul.content_id
GROUP BY c.id, c.title, c.content_type
ORDER BY times_saved DESC
LIMIT 10;
```

### Add Content to User's List

```sql
INSERT INTO user_lists (user_id, content_id)
VALUES (1, 2)
ON CONFLICT DO NOTHING;
```

### Remove Content from User's List

```sql
DELETE FROM user_lists
WHERE user_id = 1 AND content_id = 2;
```

---

## DATA TYPES REFERENCE

### Numeric Types

| Type | Range | Notes |
|------|-------|-------|
| SERIAL | 1-2,147,483,647 | Auto-incrementing integer |
| INTEGER | -2,147,483,648 to 2,147,483,647 | 32-bit integer |
| DECIMAL(3,1) | -99.9 to 99.9 | Fixed-point (for ratings) |

### String Types

| Type | Max Length | Notes |
|------|------------|-------|
| VARCHAR(n) | n characters | Variable-length string |
| TEXT | ~1 GB | Unlimited variable-length |

### Date/Time Types

| Type | Format | Notes |
|------|--------|-------|
| TIMESTAMP | 2025-12-27T10:57:12.000Z | Without timezone (UTC assumed) |
| TIMESTAMP WITH TIME ZONE | ISO 8601 | With timezone information |

### Special Types

| Type | Notes |
|------|-------|
| JSONB | Binary JSON, supports indexing and querying |
| BOOLEAN | TRUE / FALSE |

---

## PERFORMANCE NOTES

### Index Usage

- **users(email)**: Used for login queries — Essential
- **users(stripe_customer_id)**: Used for Stripe webhooks — Important
- **content(genre)**: Used for filtering — Important
- **content(content_type)**: Used for film vs TV filtering — Important
- **user_lists(user_id)**: Used for user watchlists — Important
- **user_lists(content_id)**: Used for content popularity — Optional

### Query Optimization Tips

1. **Always filter by content_type or genre first** (uses indexes)
2. **Use pagination with LIMIT/OFFSET** for large result sets
3. **Join user_lists only when needed** (can be expensive with many users)
4. **Use ILIKE for case-insensitive search** instead of LIKE

---

## BACKUP AND RESTORE

### Create Backup

```bash
# Backup entire database
pg_dump "postgresql://user:pass@host/postgres" > backup.sql

# Backup specific table
pg_dump "postgresql://user:pass@host/postgres" -t content > content-backup.sql
```

### Restore from Backup

```bash
# Restore entire database
psql "postgresql://user:pass@host/postgres" < backup.sql

# Restore specific table
psql "postgresql://user:pass@host/postgres" < content-backup.sql
```

---

## MIGRATION NOTES

This schema is designed to be identical between Supabase and Neon. No schema changes are required during migration.

**Tables to migrate**: All 3 (users, content, user_lists)
**Tables with data**: Only content (7 seed records)
**Foreign keys**: Maintained (user_lists references users and content)
**Constraints**: All preserved during migration

---

**Schema version**: 1.0 (2025-12-27)
**Compatible databases**: PostgreSQL 12+
**Tested platforms**: Supabase, Neon

