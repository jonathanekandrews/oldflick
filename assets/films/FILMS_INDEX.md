# Films Database Index

**Purpose**: Track all films in the OldFlick database
**Last Updated**: December 28, 2025
**Total Films**: 3 (Sample data)

## Films Inventory

### 1. The Kid (1921)

| Field | Value |
|-------|-------|
| **ID** | 1 |
| **Title** | The Kid |
| **Director** | Charlie Chaplin |
| **Release Year** | 1921 |
| **Runtime** | 68 minutes |
| **Genre** | Comedy, Drama |
| **Rating** | 8.3/10 |
| **Status** | Available |
| **Content Type** | film |
| **Plot** | A destitute tramp discovers an abandoned child and decides to raise him. Together they form an unbreakable bond as they navigate life's hardships with humor and heart. |
| **Cast** | Charlie Chaplin, Jackie Coogan, Edna Purviance |
| **Poster URL** | https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&h=750&fit=crop |
| **Featured** | No |
| **Masterpiece** | No |
| **Cult** | No |

**Notes**:
- Silent film era classic
- Chaplin's first full-length feature film
- Emotional comedy-drama blend
- Currently displaying correctly in ClassicFilms page

---

### 2. The General (1926)

| Field | Value |
|-------|-------|
| **ID** | 2 |
| **Title** | The General |
| **Director** | Buster Keaton |
| **Release Year** | 1926 |
| **Runtime** | 78 minutes |
| **Genre** | Comedy, Action, Adventure |
| **Rating** | 8.1/10 |
| **Status** | Available |
| **Content Type** | film |
| **Plot** | A Confederate engineer chases Union spies who have stolen his beloved locomotive, performing incredible stunts along the way. |
| **Cast** | Buster Keaton, Marion Mack, Glen Cavender |
| **Poster URL** | https://images.unsplash.com/photo-1489599849228-bed96c3f4c4f?w=500&h=750&fit=crop |
| **Featured** | No |
| **Masterpiece** | No |
| **Cult** | No |

**Notes**:
- Keaton's masterpiece of physical comedy
- Features real stunts and practical effects
- Silent film with action sequences
- Restored prints available

---

### 3. Metropolis (1927)

| Field | Value |
|-------|-------|
| **ID** | 3 |
| **Title** | Metropolis |
| **Director** | Fritz Lang |
| **Release Year** | 1927 |
| **Runtime** | 153 minutes |
| **Genre** | Science Fiction, Drama |
| **Rating** | 8.3/10 |
| **Status** | Available |
| **Content Type** | film |
| **Plot** | In a futuristic city sharply divided between the working class and the city planners, the son of the city's mastermind falls in love with a working class prophet, threatening to disrupt the carefully maintained social hierarchy. |
| **Cast** | Alfred Abel, Gustav Fröhlich, Brigitte Helm |
| **Poster URL** | https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&h=750&fit=crop |
| **Featured** | No |
| **Masterpiece** | No |
| **Cult** | No |

**Notes**:
- Groundbreaking science fiction film
- Epic scale for the 1920s
- Exploring class struggle themes
- Multiple restored versions exist

---

## Database Statistics

| Metric | Value |
|--------|-------|
| Total Films | 3 |
| Average Rating | 8.23/10 |
| Earliest Release | 1921 |
| Latest Release | 1927 |
| Total Runtime (hours) | 4:39 |
| Directors Represented | 3 |
| Countries | USA (3), Germany (1) |
| Unique Genres | 5 (Comedy, Drama, Action, Adventure, Science Fiction) |

## Genres Distribution

- Comedy: 2 films
- Drama: 2 films
- Action: 1 film
- Adventure: 1 film
- Science Fiction: 1 film

## Storage Status

### Poster Images
- ✅ All 3 posters using valid Unsplash URLs
- ✅ URLs returning 200 OK (verified)
- ✅ Images displaying in UI

### Video Files
- ⏳ To be added to Bunny.NET CDN
- 📋 Awaiting video file uploads
- 📊 Streaming infrastructure ready

## Next Steps

1. **Add More Films**: Expand database with additional classic films
2. **Upload Videos**: Add actual film files to Bunny.NET
3. **Update Metadata**: Add IMDb IDs, alternate titles
4. **Add Ratings**: Implement user rating system
5. **Manage Collections**: Create themed collections

## Query Examples

### Get all films
```sql
SELECT id, title, director, release_year, rating
FROM content
WHERE content_type = 'film'
ORDER BY release_year ASC;
```

### Get top-rated films
```sql
SELECT title, rating, director
FROM content
WHERE content_type = 'film' AND rating >= 8.0
ORDER BY rating DESC;
```

### Get films by genre
```sql
SELECT title, genre
FROM content
WHERE content_type = 'film' AND genre LIKE '%Drama%'
ORDER BY release_year ASC;
```

---

**Document Type**: Reference File
**Audience**: Developers, Content Managers
**Last Updated By**: Architecture Refactoring
**Update Frequency**: As films are added/modified
