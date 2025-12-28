# TV Shows Database Index

**Purpose**: Track all TV shows in the OldFlick database
**Last Updated**: December 28, 2025
**Total Shows**: 0 (Sample data not yet added)

## Shows Inventory

Currently, no TV shows have been added to the database. This section will be populated as shows are added.

### Template for New Shows

When adding a new show, use this structure:

```
### Show Title (Year)

| Field | Value |
|-------|-------|
| **ID** | X |
| **Title** | Show Title |
| **Creator/Producer** | Name |
| **Release Year** | YYYY |
| **Total Episodes** | X |
| **Seasons** | X |
| **Genre** | Genre1, Genre2 |
| **Rating** | X.X/10 |
| **Status** | Available |
| **Content Type** | tv |
| **Description** | Short description of the show |
| **Cast** | Actor 1, Actor 2, Actor 3 |
| **Poster URL** | URL to poster image |
| **Featured** | Yes/No |

**Notes**:
- Any relevant information
- Production notes
- Restoration status
```

## Database Statistics

| Metric | Value |
|--------|-------|
| Total Shows | 0 |
| Average Rating | N/A |
| Episodes Total | 0 |
| Seasons Total | 0 |

## Shows by Genre

(To be populated as shows are added)

## Storage Status

### Poster Images
- ⏳ Awaiting show additions
- 📋 Unsplash URLs recommended for sample data

### Video Files
- ⏳ To be added to Bunny.NET CDN
- 📋 Awaiting video file uploads
- 📊 Streaming infrastructure ready

## Adding Shows

### Step 1: Prepare Metadata
- Gather show information
- Find high-quality poster images
- Collect cast information

### Step 2: Create Database Record
```sql
INSERT INTO content (
  title, description, content_type, genre, release_year,
  rating, runtime_minutes, poster_url, director, actors,
  plot_summary, available
) VALUES (
  'Show Title', 'Description', 'tv', 'Genre1, Genre2', 1960,
  7.8, 50, 'https://...', 'Creator Name', 'Actor1, Actor2',
  'Plot summary', true
);
```

### Step 3: Upload Video
- Upload episodes to Bunny.NET
- Update CDN URLs in database
- Test streaming

### Step 4: Update This Index
- Add show to SHOWS_INDEX.md
- Update statistics
- Document any notes

## Reference Shows to Add

Potential classic TV shows to add:

1. **The Twilight Zone** (1959-1964)
   - 156 episodes, 5 seasons
   - Science fiction anthology
   - Creator: Rod Serling

2. **Gunsmoke** (1955-1975)
   - 635 episodes, 20 seasons
   - Western drama
   - Star: James Arness

3. **I Love Lucy** (1951-1957)
   - 180 episodes, 6 seasons
   - Comedy
   - Stars: Lucille Ball, Desi Arnaz

4. **The Honeymooners** (1955-1956)
   - 39 episodes, 1 season
   - Comedy
   - Stars: Jackie Gleason, Art Carney

5. **Perry Mason** (1957-1966)
   - 271 episodes, 9 seasons
   - Crime drama
   - Star: Raymond Burr

## Query Examples

### Get all shows
```sql
SELECT id, title, genre, release_year, rating
FROM content
WHERE content_type = 'tv'
ORDER BY release_year ASC;
```

### Get shows by genre
```sql
SELECT title, rating, release_year
FROM content
WHERE content_type = 'tv' AND genre LIKE '%Drama%'
ORDER BY rating DESC;
```

### Get top-rated shows
```sql
SELECT title, rating, genre, release_year
FROM content
WHERE content_type = 'tv' AND rating >= 8.0
ORDER BY rating DESC;
```

---

**Document Type**: Reference File
**Audience**: Developers, Content Managers
**Last Updated By**: Architecture Refactoring
**Update Frequency**: As shows are added/modified
**Status**: Awaiting initial show additions
