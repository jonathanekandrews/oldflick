# Manual Content Addition Guide for Oldflick

**Last Updated**: 2025-12-27
**Database**: Neon PostgreSQL
**Status**: ✅ Ready for Content

---

## Overview

Your Oldflick database is now live and connected. You can add movies and TV shows in three ways:

1. **Neon SQL Editor** (Fastest)
2. **Your API** (If you build the admin endpoints)
3. **Direct SQL** (Via psql or database tools)

This guide covers all three methods.

---

## Method 1: Neon SQL Editor (Recommended for Quick Testing)

### Step 1: Open Neon Console
1. Go to https://console.neon.tech
2. Open your **Oldflick.com** project
3. Click **SQL Editor**

### Step 2: Add a Movie

Paste this SQL to add a movie:

```sql
INSERT INTO content (
  title,
  description,
  content_type,
  genre,
  release_year,
  rating,
  runtime_minutes,
  director,
  actors,
  plot_summary,
  poster_url,
  video_url,
  available
) VALUES (
  'Inception',
  'A mind-bending sci-fi thriller',
  'film',
  'Science Fiction',
  2010,
  8.8,
  148,
  'Christopher Nolan',
  'Leonardo DiCaprio, Ellen Page, Joseph Gordon-Levitt',
  'A skilled thief must infiltrate the dreams of a corporate executive to plant an idea in his mind.',
  'https://images.unsplash.com/photo-1489599849228-13a80a36cd48?w=300&h=450&fit=crop',
  'https://example.com/inception.mp4',
  true
);
```

### Step 3: Add a TV Show

```sql
INSERT INTO content (
  title,
  description,
  content_type,
  genre,
  release_year,
  rating,
  runtime_minutes,
  director,
  plot_summary,
  poster_url,
  video_url,
  available
) VALUES (
  'Breaking Bad',
  'A high school teacher turns to drug dealing',
  'tv',
  'Crime Drama',
  2008,
  9.5,
  47,
  'Vince Gilligan',
  'Walter White, a chemistry teacher, partners with a former student to manufacture methamphetamine.',
  'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=300&h=450&fit=crop',
  'https://example.com/breaking-bad.mp4',
  true
);
```

### Step 4: Verify Content Added

```sql
-- View all content
SELECT id, title, content_type, genre, release_year FROM content ORDER BY id;

-- Count total content
SELECT COUNT(*) as total_content FROM content;
```

### Step 5: Click Execute
Your content is now in the database!

---

## Method 2: Using Your API (If You Build Admin Endpoints)

You can create an admin API endpoint to insert content. Example structure:

```javascript
POST /api/admin/content
Content-Type: application/json

{
  "title": "Your Movie",
  "description": "Description here",
  "content_type": "film",
  "genre": "Action",
  "release_year": 2024,
  "rating": 8.5,
  "runtime_minutes": 120,
  "director": "Director Name",
  "actors": "Actor 1, Actor 2",
  "plot_summary": "Plot here",
  "poster_url": "https://...",
  "video_url": "https://...",
  "available": true
}
```

---

## Method 3: Direct SQL via psql (Advanced)

If you have PostgreSQL client tools installed:

```bash
psql "postgresql://oldflick_app:oldflick_secure_password_123@ep-still-bread-abslny2n.eu-west-2.aws.neon.tech/neondb?sslmode=require" \
  -c "INSERT INTO content ..."
```

---

## Database Schema Reference

### CONTENT Table Columns

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| id | SERIAL | Auto | Primary key, auto-incremented |
| title | VARCHAR(255) | YES | Movie/show name |
| description | TEXT | NO | Short description (1-2 sentences) |
| content_type | VARCHAR(50) | NO | 'film' or 'tv' |
| genre | VARCHAR(100) | NO | Genre (e.g., "Action", "Comedy") |
| release_year | INTEGER | NO | Release year (e.g., 2024) |
| rating | DECIMAL(3,1) | NO | IMDb/custom rating (0.0-10.0) |
| runtime_minutes | INTEGER | NO | Duration in minutes |
| poster_url | VARCHAR(500) | NO | URL to poster image |
| director | VARCHAR(255) | NO | Director name(s) |
| actors | TEXT | NO | Cast list (comma-separated) |
| plot_summary | TEXT | NO | Full plot description |
| video_url | VARCHAR(500) | NO | URL to video file |
| available | BOOLEAN | NO | Is content available (default: true) |
| created_date | TIMESTAMP | Auto | Auto-set to current time |
| updated_date | TIMESTAMP | Auto | Auto-set to current time |

---

## Example: Bulk Add Multiple Movies

```sql
INSERT INTO content (title, description, content_type, genre, release_year, rating, runtime_minutes, director, poster_url, available)
VALUES
  ('The Matrix', 'A hacker discovers reality is a simulation', 'film', 'Science Fiction', 1999, 8.7, 136, 'Lana Wachowski', 'https://example.com/matrix.jpg', true),
  ('Pulp Fiction', 'Interconnected stories of crime and violence', 'film', 'Crime', 1994, 8.9, 154, 'Quentin Tarantino', 'https://example.com/pulpfiction.jpg', true),
  ('Friends', 'Six friends living in New York City', 'tv', 'Comedy', 1994, 8.9, 22, 'David Crane', 'https://example.com/friends.jpg', true),
  ('The Office', 'Documentary style comedy about office workers', 'tv', 'Comedy', 2005, 9.0, 22, 'Greg Daniels', 'https://example.com/theoffice.jpg', true);
```

---

## Database Connection Info

### Current Configuration

**Database**: neondb
**Host**: ep-still-bread-abslny2n.eu-west-2.aws.neon.tech
**User**: oldflick_app
**Password**: oldflick_secure_password_123
**Region**: EU-West-2 (London)

### Connection String

```
postgresql://oldflick_app:oldflick_secure_password_123@ep-still-bread-abslny2n.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

---

## Testing Your Content in the Application

### 1. Start Your Backend

```bash
npm run dev:server
```

You should see:
```
✅ Database connection successful!
  Content records in database: X
```

### 2. Start Your Frontend

```bash
npm run dev
```

### 3. Browse to http://localhost:5000

Your content should appear in:
- Browse page
- Search results
- Genre filters

---

## Troubleshooting

### Content Not Showing in Frontend?

1. **Clear cache**: Refresh browser (Ctrl+F5)
2. **Check backend logs**: Look for errors in `npm run dev:server`
3. **Verify in database**: Run `SELECT COUNT(*) FROM content;` in Neon SQL Editor
4. **Check API**: Visit `http://localhost:3001/api/content` to see raw JSON

### Want to Delete Content?

```sql
DELETE FROM content WHERE id = 1;

-- Or delete all content
DELETE FROM content;
```

### Want to Update Content?

```sql
UPDATE content
SET rating = 8.5, available = false
WHERE id = 1;
```

---

## Next Steps

1. ✅ **Database Created** - Done!
2. ✅ **Backend Connected** - Done!
3. 📝 **Add Content** - Use SQL Editor above
4. 🧪 **Test Frontend** - Browse content in your app
5. 🎬 **Add Real Videos** - Replace placeholder URLs with actual video/image URLs

---

## Need More Genres or Types?

The schema is flexible - just use whatever values you want:
- **content_type**: 'film', 'tv', 'series', 'documentary', etc.
- **genre**: 'Action', 'Comedy', 'Horror', 'Thriller', etc.

No need to modify the database schema!

---

**Database Ready!** 🎉
Your Oldflick streaming platform is live and ready for content.
