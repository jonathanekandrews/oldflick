# OldFlick Assets Index

**Purpose**: Master index of all reference files and asset documentation
**Last Updated**: December 28, 2025
**Version**: 1.0
**Total Assets**: 8 reference files

---

## Assets Directory Structure

```
assets/
├── ASSETS_INDEX.md                          # This file
├── SEARCH_INDEX_REFERENCE.md                # Master search index with metadata
├── films/
│   └── FILMS_INDEX.md                      # All films in database
├── shows/
│   └── SHOWS_INDEX.md                      # All shows in database (template)
├── film-images/
│   └── FILM_POSTER_INVENTORY.md            # Film poster tracking
├── show-images/
│   └── SHOW_POSTER_INVENTORY.md            # Show poster tracking
├── microservices/
│   └── SERVICES_REFERENCE.md               # Service ports & endpoints
└── messaging/
    └── MESSAGE_PROTOCOL.md                 # Inter-service communication
├── api-reference/
    └── API_ENDPOINTS.md                    # Complete API documentation
```

---

## Quick Reference Guide

### Content Management

| Document | Purpose | Content |
|----------|---------|---------|
| **FILMS_INDEX.md** | Film database inventory | 3 sample films with metadata |
| **SHOWS_INDEX.md** | TV shows inventory | Template ready for shows |
| **SEARCH_INDEX_REFERENCE.md** | Master searchable index | Full metadata for search function |

### Asset Management

| Document | Purpose | Content |
|----------|---------|---------|
| **FILM_POSTER_INVENTORY.md** | Film image tracking | 3 poster URLs with verification |
| **SHOW_POSTER_INVENTORY.md** | Show image tracking | Template for show posters |

### Technical Reference

| Document | Purpose | Content |
|----------|---------|---------|
| **SERVICES_REFERENCE.md** | Microservices guide | 6 services, ports, APIs |
| **MESSAGE_PROTOCOL.md** | Service communication | Sync/async patterns |
| **API_ENDPOINTS.md** | API documentation | All endpoints with examples |

---

## File Details

### 1. SEARCH_INDEX_REFERENCE.md

**Location**: `assets/SEARCH_INDEX_REFERENCE.md`

**Purpose**: Master searchable index with comprehensive metadata

**Contains**:
- Complete metadata for all 3 films
- Full cast, crew, keywords, themes
- Search algorithm explanation
- Fuzzy matching examples
- Intelligent suggestion logic
- SQL schema for search
- Guidelines for adding new content

**Use Case**:
- Developers building search function
- Understanding how suggestions work
- Adding metadata for new films/shows

**Key Sections**:
- Search Index Structure
- Complete Film Entries (3 films)
- Search Algorithm (5 levels)
- Fuzzy Matching Examples
- SQL Schema
- Adding New Content
- Future Enhancements

**Example Search Flows**:
```
"The Kid" → Exact match → Found
"kid" → Partial match → Found (The Kid)
"silent comedy" → Full-text search → Found (3 matches)
"robot movie" → Intelligent suggestions → Metropolis
"old train thing" → Fuzzy suggestions → The General
```

---

### 2. FILMS_INDEX.md

**Location**: `assets/films/FILMS_INDEX.md`

**Purpose**: Database inventory of all films

**Contains**:
- 3 sample films with complete metadata
- Title, director, cast, year, rating
- Genre, runtime, plot summary
- Database status
- Query examples
- Distribution statistics

**Use Case**:
- Quick reference for films in database
- Content manager tracking
- Verifying what's in system

**Database Statistics**:
- Total Films: 3
- Average Rating: 8.23/10
- Earliest: 1921
- Latest: 1927
- Genres: 5 unique

---

### 3. SHOWS_INDEX.md

**Location**: `assets/shows/SHOWS_INDEX.md`

**Purpose**: Database inventory of TV shows (template)

**Contains**:
- Template for adding shows
- Guidelines for show structure
- Recommended shows to add
- Query examples

**Use Case**:
- Planning show additions
- Template for new shows
- Content manager reference

**Current Status**: No shows added yet (ready for content)

**Recommended Shows**:
- The Twilight Zone (1959-1964) - 156 episodes
- Gunsmoke (1955-1975) - 635 episodes
- I Love Lucy (1951-1957) - 180 episodes

---

### 4. FILM_POSTER_INVENTORY.md

**Location**: `assets/film-images/FILM_POSTER_INVENTORY.md`

**Purpose**: Track film poster images and sources

**Contains**:
- 3 film posters with Unsplash URLs
- Image specifications (dimensions, size, format)
- Verification status (HTTP 200)
- Load time performance
- Guidelines for new posters
- Responsive image code
- Migration to Bunny.NET strategy

**Use Case**:
- Image URL management
- Performance tracking
- Adding new film images
- Planning CDN migration

**Current Images**:
1. The Kid: https://images.unsplash.com/photo-1485846234645-a62644f84728
2. The General: https://images.unsplash.com/photo-1489599849228-bed96c3f4c4f
3. Metropolis: https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85

**All URLs verified**: ✅ 200 OK, <500ms load time

---

### 5. SHOW_POSTER_INVENTORY.md

**Location**: `assets/show-images/SHOW_POSTER_INVENTORY.md`

**Purpose**: Track TV show poster images (template)

**Contains**:
- Template for show posters
- Image requirements
- Show source recommendations
- Recommended shows to add
- Poster variation handling
- Responsive image code

**Use Case**:
- Planning show additions
- Image specification reference
- Poster management template

**Current Status**: No shows added (ready for content)

---

### 6. SERVICES_REFERENCE.md

**Location**: `assets/microservices/SERVICES_REFERENCE.md`

**Purpose**: Quick reference for all microservices

**Contains**:
- Service architecture diagram
- Detailed service breakdown:
  - **Auth Service** (Port 3001)
  - **Content Service** (Port 3002)
  - **User Service** (Port 3003)
  - **Payment Service** (Port 3004)
  - **Media Service** (Port 3005)
  - **Admin Service** (Port 3006)
  - **API Gateway** (Port 3000)
- Shared resources documentation
- Health check examples
- Service communication patterns

**Use Case**:
- Quick port lookup
- Understanding service architecture
- Finding service responsibilities
- Development checklist

**Key Information**:
```
API Gateway     → Port 3000
Auth Service    → Port 3001
Content Service → Port 3002
Users Service   → Port 3003
Payments        → Port 3004
Media Service   → Port 3005
Admin Service   → Port 3006
```

---

### 7. MESSAGE_PROTOCOL.md

**Location**: `assets/messaging/MESSAGE_PROTOCOL.md`

**Purpose**: Define inter-service communication patterns

**Contains**:
- Synchronous (REST/HTTP) communication
- Asynchronous (Message Queue) patterns
- Request/response headers
- Status codes
- Service discovery
- Error propagation
- Timeout & retry strategies
- Circuit breaker pattern
- Logging & tracing
- Monitoring & metrics
- Future messaging implementation

**Use Case**:
- Understanding service communication
- Building service-to-service calls
- Implementing error handling
- Monitoring service health

**Communication Patterns**:
- Synchronous: Direct HTTP requests (current)
- Asynchronous: Event-driven queues (future)

**Example Flow**:
```
Request → Gateway → Routes to Service → Service processes → Response
```

---

### 8. API_ENDPOINTS.md

**Location**: `assets/api-reference/API_ENDPOINTS.md`

**Purpose**: Complete API endpoint documentation

**Contains**:
- Authentication endpoints (4)
- Content endpoints (6)
- User endpoints (5)
- Payment endpoints (2)
- Media endpoints (2)
- Admin endpoints (2)
- Error responses and codes
- Rate limiting details
- Testing examples (curl, Postman, REST Client)

**Use Case**:
- API development reference
- Frontend developer guide
- Testing API calls
- Understanding request/response

**All Endpoints**:

**Auth (Public)**:
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout` (Protected)
- `GET /api/auth/me` (Protected)

**Content (Public)**:
- `GET /api/content`
- `GET /api/content/:id`
- `GET /api/content/search`
- `POST /api/content` (Admin)
- `PUT /api/content/:id` (Admin)
- `DELETE /api/content/:id` (Admin)

**Users (Protected)**:
- `GET /api/users/profile`
- `PUT /api/users/profile`
- `GET /api/users/watchlist`
- `POST /api/users/watchlist/:id`
- `DELETE /api/users/watchlist/:id`
- `POST /api/users/ratings`

**Media (Protected)**:
- `GET /api/media/:id/stream`
- `POST /api/media/:id/playback`

**Payments (Protected)**:
- `POST /api/payments/checkout`
- `GET /api/payments/status`

**Admin (Protected, Admin Only)**:
- `GET /api/admin/users`
- `PUT /api/admin/users/:id/role`

---

## Using These Reference Files

### For Frontend Developers

1. **API_ENDPOINTS.md** - Understand all API calls available
2. **SERVICES_REFERENCE.md** - Know which service handles what
3. **MESSAGE_PROTOCOL.md** - Understand communication patterns

### For Backend Developers

1. **SERVICES_REFERENCE.md** - Service ports and responsibilities
2. **API_ENDPOINTS.md** - Endpoint specifications
3. **MESSAGE_PROTOCOL.md** - Service-to-service communication
4. **SEARCH_INDEX_REFERENCE.md** - Search implementation

### For Content Managers

1. **FILMS_INDEX.md** - Current film inventory
2. **SHOWS_INDEX.md** - Show management template
3. **FILM_POSTER_INVENTORY.md** - Image tracking
4. **SHOW_POSTER_INVENTORY.md** - Show image template

### For DevOps/Architects

1. **SERVICES_REFERENCE.md** - Architecture overview
2. **MESSAGE_PROTOCOL.md** - Communication patterns
3. **API_ENDPOINTS.md** - Monitoring endpoints
4. All documentation - Full system understanding

### For Search Engineers

1. **SEARCH_INDEX_REFERENCE.md** - Complete search reference
2. **FILMS_INDEX.md** - Searchable content
3. **SHOWS_INDEX.md** - Future searchable content
4. **API_ENDPOINTS.md** - Search endpoint reference

---

## Key Statistics

### Content Inventory

| Type | Count |
|------|-------|
| Films | 3 |
| Shows | 0 |
| Total Content | 3 |
| Genres | 5 |
| Directors | 3 |
| Actors | 13+ |
| Countries | 2 |

### Technical Assets

| Type | Count |
|------|-------|
| Reference Docs | 8 |
| Services | 6 |
| API Endpoints | 21 |
| Microservices Ports | 7 |

### Image Assets

| Type | Count |
|------|-------|
| Film Posters | 3 |
| Show Posters | 0 |
| CDN Provider | Unsplash (free) |
| All Verified | ✅ Yes |

---

## Quick Links

### Content Files
- [Films Index](films/FILMS_INDEX.md)
- [Shows Index](shows/SHOWS_INDEX.md)
- [Search Index](SEARCH_INDEX_REFERENCE.md)

### Image Files
- [Film Posters](film-images/FILM_POSTER_INVENTORY.md)
- [Show Posters](show-images/SHOW_POSTER_INVENTORY.md)

### Technical Files
- [Services Reference](microservices/SERVICES_REFERENCE.md)
- [Message Protocol](messaging/MESSAGE_PROTOCOL.md)
- [API Endpoints](api-reference/API_ENDPOINTS.md)

---

## Adding New Content

### Adding a Film

1. **Create metadata** in FILMS_INDEX.md
2. **Find poster URL** in FILM_POSTER_INVENTORY.md
3. **Add search index** in SEARCH_INDEX_REFERENCE.md
4. **Insert database record** with poster_url
5. **Verify display** in UI

### Adding a Show

1. **Use template** from SHOWS_INDEX.md
2. **Find poster URL** in SHOW_POSTER_INVENTORY.md
3. **Add search index** in SEARCH_INDEX_REFERENCE.md
4. **Insert database record** with poster_url
5. **Verify display** in UI

### Adding an Endpoint

1. **Document in** API_ENDPOINTS.md
2. **Update** SERVICES_REFERENCE.md
3. **Add** MESSAGE_PROTOCOL.md notes if needed

---

## Maintenance Schedule

### Daily
- Monitor API response times (API_ENDPOINTS.md)
- Track user searches (SEARCH_INDEX_REFERENCE.md)

### Weekly
- Update FILMS_INDEX.md if films added
- Verify image URLs (FILM_POSTER_INVENTORY.md)

### Monthly
- Review search effectiveness
- Plan content additions
- Update statistics

### Quarterly
- Comprehensive audit of all indices
- Plan major feature additions
- Review architecture changes

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-28 | Initial creation with 8 reference files |

---

## Related Documents

- `MICROSERVICES_ARCHITECTURE.md` - Design overview
- `docs/MICROSERVICES_SETUP.md` - Setup guide
- `MICROSERVICES_QUICKSTART.md` - Getting started
- `REFACTORING_PROGRESS.md` - Project progress

---

## Support

**Questions about these documents?**
- Check specific document (see Quick Reference Guide)
- Review example section
- Check troubleshooting section if present

**Adding new content?**
- Follow the "Adding New Content" section above
- Use templates provided
- Update this index

**Need more info?**
- See main documentation in `/docs`
- Check `MICROSERVICES_SETUP.md` for overall architecture

---

**Document Type**: Master Index
**Audience**: All team members
**Last Updated By**: Architecture Refactoring
**Update Frequency**: As assets are added/modified
**Status**: ✅ Complete and ready for use
