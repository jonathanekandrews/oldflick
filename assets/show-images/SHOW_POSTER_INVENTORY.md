# TV Show Poster Image Inventory

**Purpose**: Track all TV show poster images and their sources
**Last Updated**: December 28, 2025
**Total Posters**: 0 (No shows in database yet)
**Status**: Ready for content

## Overview

This inventory tracks poster images for TV shows. Currently, no TV shows have been added to the OldFlick database. This template is prepared for when shows are added.

---

## Show Poster Template

When adding a new show, use this structure:

```markdown
### Show Title (Year Range)

| Property | Value |
|----------|-------|
| **Show ID** | X |
| **Title** | Show Title |
| **Creator/Producer** | Name(s) |
| **Years** | 1960-1965 |
| **Seasons** | X |
| **Episodes** | X |
| **Image URL** | URL |
| **Source** | Unsplash/TMDB/etc |
| **Dimensions** | 500x750px |
| **Format** | JPEG |
| **File Size** | ~45KB |
| **Status** | ✅/⏳/❌ |
| **HTTP Status** | 200 OK |
| **Load Time** | <500ms |

**Notes**:
- Key details about the show
- Production notes
- Availability status
```

---

## Image Requirements for TV Shows

### Format Specifications

- **Aspect Ratio**: 2:3 (same as films)
- **Minimum Size**: 500x750 pixels
- **Recommended Size**: 800x1200 pixels
- **Format**: JPEG or WebP
- **File Size**: <100KB
- **Quality**: High-quality promotional artwork

### Show Poster Sources

**Best Sources**:
1. **TMDB API** (Official artwork)
   - Requires API key
   - High-quality official posters
   - Multiple images per show

2. **Unsplash** (Free stock images)
   - Use relevant TV/broadcast images
   - Must match show aesthetic

3. **Show Official Sites**
   - Press kits often have posters
   - May require licensing

4. **IMDb** (With permission)
   - Official show artwork
   - Requires proper attribution

---

## Recommended Shows to Add

### Priority 1: Classic Television (1950s-1960s)

#### The Twilight Zone (1959-1964)
- Episodes: 156
- Seasons: 5
- Genre: Science Fiction, Anthology, Drama
- Status: Highly recommended

#### Gunsmoke (1955-1975)
- Episodes: 635
- Seasons: 20
- Genre: Western, Drama
- Status: Most watched western

#### I Love Lucy (1951-1957)
- Episodes: 180
- Seasons: 6
- Genre: Comedy, Sitcom
- Status: Groundbreaking sitcom

#### The Honeymooners (1955-1956)
- Episodes: 39
- Seasons: 1
- Genre: Comedy, Sitcom
- Status: Influential sitcom

#### Perry Mason (1957-1966)
- Episodes: 271
- Seasons: 9
- Genre: Crime, Drama, Mystery
- Status: Popular detective series

### Priority 2: 1970s-1980s Classics

- M*A*S*H (1972-1983)
- The Mary Tyler Moore Show (1970-1977)
- All in the Family (1971-1979)
- The Golden Girls (1985-1992)
- Cheers (1982-1993)

---

## Database Integration

### Store Show Posters

```sql
-- Add poster_url to content table if not exists
ALTER TABLE content ADD COLUMN IF NOT EXISTS poster_url VARCHAR(500);

-- Add show-specific metadata
ALTER TABLE content ADD COLUMN IF NOT EXISTS total_episodes INTEGER;
ALTER TABLE content ADD COLUMN IF NOT EXISTS total_seasons INTEGER;
```

### Example Insert for a Show

```sql
INSERT INTO content (
  title,
  description,
  content_type,
  genre,
  release_year,
  rating,
  runtime_minutes,
  poster_url,
  director,
  actors,
  plot_summary,
  available,
  total_episodes,
  total_seasons
) VALUES (
  'The Twilight Zone',
  'An anthology series of thought-provoking stories...',
  'tv',
  'Science Fiction, Drama, Anthology',
  1959,
  9.0,
  25,
  'https://images.unsplash.com/...',
  'Rod Serling',
  'Rod Serling, various guest stars',
  'Each episode presents a complete story...',
  true,
  156,
  5
);
```

---

## Show Poster Variations

### Different Seasons/Versions

Some shows may have multiple poster versions:

```
Show ID 4: The Twilight Zone (Original Series)
├── Poster Option 1: Classic title card design
├── Poster Option 2: Episode still
└── Poster Option 3: Key artwork

Solution: Use most recognizable version or create season-specific entries
```

### Handling Multiple Seasons

```
The Golden Girls - All Seasons (1985-1992)
├── Single show entry with show poster
├── OR individual entries per season
└── Recommendation: Single entry with flag for multi-season show
```

---

## Statistics (When Shows Added)

| Metric | Value |
|--------|-------|
| Total Shows | 0 |
| Total Episodes | 0 |
| Total Seasons | 0 |
| Posters | 0 |
| CDN: | Unsplash (temporary) |

---

## Troubleshooting Show Posters

### Issue: Multiple Poster Versions
**Solution**: Use most iconic/official version, document alternatives

### Issue: Incomplete Show Run
**Solution**: Document years span in subtitle (1959-1964)

### Issue: Reboots/Revivals
**Solution**: Create separate entries for different versions

### Issue: International Versions
**Solution**: Create separate entries, note region difference

---

## Delivery Optimization for Shows

### Mobile Display
```url
?w=300&h=450&fit=crop&q=60
```

### Tablet Display
```url
?w=500&h=750&fit=crop&q=75
```

### Desktop Display
```url
?w=800&h=1200&fit=crop&q=85
```

---

## Responsive Image Code Example

```jsx
// Show poster with responsive srcset
<img
  srcSet={`
    ${show.poster_url}?w=300&h=450&fit=crop&q=60 300w,
    ${show.poster_url}?w=500&h=750&fit=crop&q=75 500w,
    ${show.poster_url}?w=800&h=1200&fit=crop&q=85 800w
  `}
  sizes="(max-width: 600px) 300px, (max-width: 900px) 500px, 800px"
  alt={show.title}
  className="show-poster"
/>
```

---

## Adding Your First Show

### Step-by-Step Process

1. **Choose Show**
   - Select classic TV show (1950s-1980s)
   - Check it fits classic film/show criteria
   - Verify availability of good poster

2. **Find Poster Image**
   - Search Unsplash for TV/broadcast imagery
   - Or use TMDB API
   - Verify dimensions (minimum 500x750)

3. **Create Database Entry**
   - Insert into content table with `content_type='tv'`
   - Add show-specific fields
   - Set poster_url

4. **Update This Index**
   - Add show to list
   - Document image source
   - Verify display in UI

5. **Test Display**
   - Check on mobile, tablet, desktop
   - Verify image loads quickly
   - Confirm sizing is correct

---

## Content Gaps

**Current Status**: No TV shows in database

**Recommended Priority**:
1. **High**: Add 5-10 classic sitcoms (I Love Lucy, Golden Girls)
2. **Medium**: Add 5-10 classic dramas (Twilight Zone, Perry Mason)
3. **Low**: Add international shows or niche content

---

## Future Enhancements

### Phase 1: Add Classic TV Shows
- Target: 50+ classic shows
- Years: 1950s-1990s
- Quality: High-definition restored versions

### Phase 2: Episode-Level Metadata
- Individual episode posters/stills
- Episode guides
- Air dates and descriptions

### Phase 3: Seasonal Content
- Season-specific posters
- Season ratings
- Top episodes per season

### Phase 4: Cross-Link Shows
- Related shows
- Actor/director connections
- Genre groupings

---

## Integration With Search Index

When shows are added, they'll automatically be included in:
- Search index (see SEARCH_INDEX_REFERENCE.md)
- API responses
- Content browsing
- Genre filtering
- Actor/director filtering

---

**Document Type**: Asset Inventory Template
**Audience**: Developers, Content Managers
**Status**: Ready for content additions
**Last Updated By**: Architecture Refactoring
**Update Frequency**: As shows are added
**Related Files**:
- `SHOWS_INDEX.md` - Show metadata details
- `FILM_POSTER_INVENTORY.md` - Film poster reference
- `SEARCH_INDEX_REFERENCE.md` - Search index for shows
- `API_ENDPOINTS.md` - Show serving API
