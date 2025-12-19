# Oldflick Schema Architecture Strategy

## Problem Statement

**Issue:** The production site crashed because the Supabase database schema diverged from what the frontend code expected.

**Root Cause:**
- Frontend was updated to expect field names like `content_type`, `release_year`, `runtime_minutes`, `poster_url`
- Supabase database was using the original field names: `type`, `year`, `duration`, `thumbnail_url`
- This mismatch caused API to return undefined fields → components crashed

**Result:** Both staging and production were broken. Films wouldn't play.

## Solution: Supabase-as-Source-of-Truth Architecture

Instead of forcing the database to match frontend expectations, we've inverted the relationship:

**Supabase is now the authoritative source** → Backend adapts → Frontend stays stable

```
┌─────────────────────────┐
│  Supabase Database      │
│  (ANY schema changes)   │
└────────────┬────────────┘
             │
┌────────────▼────────────┐
│  Schema Inspector       │
│  (Auto-detect columns)  │
└────────────┬────────────┘
             │
┌────────────▼────────────┐
│  Dynamic Field Mapper   │
│  (Map to API standard)  │
└────────────┬────────────┘
             │
┌────────────▼────────────┐
│  API Response           │
│  (Stable field names)   │
└────────────┬────────────┘
             │
┌────────────▼────────────┐
│  Frontend Components    │
│  (Unchanged)            │
└─────────────────────────┘
```

## Components Implemented

### 1. Schema Inspector (`server/db/schema-inspector.js`)

**Responsibility:** Auto-detect the actual database schema

**Features:**
- Queries `information_schema.columns` to detect real column names
- Caches schema for 5 minutes (configurable TTL)
- Provides field mapping factory
- Validates schema compatibility
- Supports both old and new field naming conventions

**Key Functions:**
```javascript
getContentTableColumns()      // Returns actual columns from Supabase
createFieldMapper()           // Creates mapping function
validateSchema()              // Checks if all required fields exist
invalidateSchemaCache()        // Force re-check on next request
```

### 2. Content Routes with Dynamic Mapping (`server/routes/content.js`)

**Responsibility:** Use schema-detected columns in queries and map responses

**Changes:**
- Calls `ensureSchemaLoaded()` on first request
- Uses `actualColumns` to decide which column name to query
- Maps responses through `fieldMapper` before returning to frontend

**Example:**
```javascript
// Before: Hardcoded
query += ` AND content_type = $1`;

// After: Dynamic
const typeCol = actualColumns['type'] ? 'type' : 'content_type';
query += ` AND ${typeCol} = $1`;

// Response mapping
res.json(result.rows.map(fieldMapper));
```

### 3. Health & Validation Endpoints (`server/index.js`)

**Two new endpoints for monitoring:**

```bash
# Health check (includes schema status)
GET /api/health
→ Returns: { status, database: { connected, schema: { valid, found, missing } } }

# Schema validation (for CI/CD)
GET /api/schema-check
→ Returns: { valid, found, missing, message }
→ Status 200 if valid, 400 if invalid
```

### 4. Deployment SOP (`DEPLOYMENT-SOP.md`)

**Comprehensive guide covering:**
- Pre-deployment schema compatibility checks
- Staging verification workflow
- Post-deployment health checks
- Schema change handling procedures
- Rollback procedures
- Troubleshooting guide

### 5. CI/CD Validation (`.github/workflows/schema-validation.yml`)

**Automated checks on every push to production/staging:**
- Validates schema introspection module syntax
- Detects hardcoded field names in frontend (prevents regressions)
- Provides deployment readiness status
- Blocks merges that would break compatibility

## Field Name Mapping

The system supports multiple naming conventions automatically:

| Database Field | → | API Field | Aliases Supported |
|---|---|---|---|
| `type` or `content_type` | `content_type` | 'film', 'tv' | Both |
| `year` or `release_year` | `release_year` | Release year | Both |
| `duration` or `runtime_minutes` | `runtime_minutes` | Length in minutes | Both |
| `thumbnail_url`, `backdrop_url`, or `poster_url` | `poster_url` | Image URL | All three |
| `rating` or `imdb_rating` | `rating` | Film rating | Both |
| `cast_members` or `actors` | `actors` | Actor list | Both |

**This means:**
- You can rename columns in Supabase at any time
- The API will continue working
- No code changes needed if you use one of the supported names

## How It Works: Concrete Example

**Scenario:** Film API request for movie ID 14

```
1. Frontend requests: GET /api/content/14

2. Backend routes to: router.get('/:id', ...)

3. ensureSchemaLoaded() runs:
   - Queries information_schema.columns
   - Finds: type, year, duration, thumbnail_url, rating, cast_members
   - Creates fieldMapper with this schema

4. Query database:
   SELECT * FROM content WHERE id = $1
   Returns: { id: 14, type: "film", year: 1931, duration: 75, ... }

5. Map response through fieldMapper:
   {
     id: 14,
     content_type: "film"      ← mapped from type
     release_year: 1931        ← mapped from year
     runtime_minutes: 75       ← mapped from duration
     poster_url: "https://..." ← mapped from thumbnail_url
     rating: 7.4               ← kept as is
     actors: "Bela Lugosi..."  ← mapped from cast_members
   }

6. Frontend receives expected field names
   → Film displays correctly
   → Video plays without crashing
```

## Supabase Schema Changes - What Happens?

### Scenario 1: You rename a column

```sql
ALTER TABLE content RENAME COLUMN type TO content_type;
```

**What happens:**
1. On next request, schema inspector detects the new column name
2. fieldMapper checks for both `type` and `content_type`
3. Finds `content_type`, uses it
4. API continues working without any code changes ✅

### Scenario 2: You add a new column

```sql
ALTER TABLE content ADD COLUMN audience_rating VARCHAR(50);
```

**What happens:**
1. Schema inspector detects the new column
2. If it's not in the mapping, fieldMapper ignores it
3. API continues working as before ✅

### Scenario 3: You remove a required column

```sql
ALTER TABLE content DROP COLUMN video_url;
```

**What happens:**
1. On next request, schema validation fails
2. `/api/schema-check` returns: `valid: false, missing: ["video_url"]`
3. Health endpoint shows: `"schema": { "valid": false }`
4. Administrators notified via health checks
5. API returns incomplete data with missing fields
6. Fix: Either restore the column or update schema mapping

## Benefits

✅ **Resilience:** Future Supabase schema changes won't crash the app
✅ **Flexibility:** Can rename/reorganize database without code changes
✅ **Transparency:** Clear audit trail of schema compatibility
✅ **Backward Compatibility:** Old and new field names both work
✅ **No Technical Debt:** Clean solution, not a band-aid
✅ **Automated Validation:** CI/CD prevents bad deployments
✅ **Observable:** Health endpoints show schema status

## Potential Future Enhancements

1. **Schema versioning:** Track schema versions over time
2. **Migration warnings:** Alert on schema changes before deployment
3. **Field deprecation:** Mark old field names as deprecated
4. **Auto-migration:** Suggest column renames if pattern detected
5. **Schema documentation:** Auto-generate API docs from schema

## Testing the System

### Verify Schema Detection
```bash
# Check what columns are actually in Supabase
curl https://oldflick.com/api/schema-check

# Should show all detected columns and validation status
```

### Verify Field Mapping
```bash
# Get a film and check the mapped field names
curl https://oldflick.com/api/content/14 | grep -E "content_type|release_year|runtime_minutes|poster_url"

# Should show standard API field names, not database field names
```

### Verify Fallback Behavior
```bash
# Request content list
curl https://oldflick.com/api/content

# Should work regardless of whether database uses old or new field names
```

## Production Impact

**Before this change:**
- Any database schema change → app crashes
- Field name mismatches → white screens
- Debugging was difficult
- Required immediate code changes

**After this change:**
- Database can evolve independently
- App adapts automatically
- Errors are visible via health endpoints
- Much safer deployments

---

**Implemented:** 2025-12-19
**Status:** Production Ready ✅
**Deployments with Schema Inspector:**
- Commit d2fb897: Schema introspection implementation
- Commit a31cc0f: Deployment SOP documentation
- Commit 09e7d8a: CI/CD validation workflow
