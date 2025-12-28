# Oldflick Production Deployment Standard Operating Procedure

## Overview

This SOP ensures that deployments to production are safe, traceable, and don't introduce breaking changes due to schema mismatches between the database and frontend code.

## Architecture

The application now uses **Supabase as the authoritative schema source**. The backend dynamically detects column names and maps them to the expected API format, ensuring backward compatibility even when the database schema changes.

```
Supabase Database (Authoritative)
         ↓
Schema Inspector (Auto-detects columns)
         ↓
Dynamic Field Mapper (Maps actual → expected fields)
         ↓
Frontend API Response (Stable interface)
```

## Pre-Deployment Checklist

### 1. Verify Supabase Schema Compatibility

Before deploying to production, verify the schema is compatible:

```bash
# Test the schema validation endpoint (can run against staging first)
curl https://oldflick.com/api/schema-check

# Expected response if valid:
{
  "valid": true,
  "found": ["✅ content_type", "✅ release_year", ...],
  "missing": [],
  "message": "✅ Schema is compatible with API requirements"
}

# If schema is invalid, response will show missing fields:
{
  "valid": false,
  "found": ["✅ content_type", "✅ video_url"],
  "missing": ["❌ poster_url (expected one of: poster_url, thumbnail_url, backdrop_url)"],
  "message": "❌ Schema has 1 missing fields"
}
```

### 2. Test on Staging First

**Never deploy directly to production. Always stage first.**

```bash
# Deploy to staging branch
git checkout staging
git pull origin staging
git merge develop  # (or your feature branch)
git push origin staging

# Wait for staging deployment to complete
# Then verify schema on staging:
curl https://staging.oldflick.com/api/schema-check

# Test critical workflows on staging:
# - Browse films/TV shows
# - Play a film/episode
# - Create/update content (admin)
# - Search functionality
```

### 3. Review Code Changes

Before merging to production:

```bash
# View all changes since last production release
git log production..staging --oneline

# For each commit, verify:
# - No hardcoded field names (should use mapped names)
# - No direct database queries without schema consideration
# - API responses always use the standard field names
```

### 4. Deploy to Production

Once staging is verified:

```bash
# Switch to production branch
git checkout production

# Merge staging into production
git merge staging

# Verify commit is included
git log --oneline -1

# Push to production (this triggers deployment)
git push origin production
```

### 5. Post-Deployment Verification

```bash
# Check health endpoint
curl https://oldflick.com/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-12-19T...",
  "database": {
    "connected": true,
    "schema": {
      "valid": true,
      "found": [...],
      "missing": [],
      "message": "✅ Schema is compatible..."
    }
  }
}

# Check schema validation
curl https://oldflick.com/api/schema-check

# Verify sample content loads
curl https://oldflick.com/api/content?content_type=film | head -100

# Test film playback (browser):
# Visit https://oldflick.com/watch?id=14 (Dracula)
# Verify video loads and plays
```

## Handling Schema Changes in Supabase

When you make changes to the Supabase schema, **the application will automatically adapt** thanks to the schema inspector.

### Adding a New Column

If you add a new field to the `content` table in Supabase:

1. The schema inspector will auto-detect it on next startup
2. No code changes needed - the app continues working
3. Optionally add field mapping logic if you want to support old column names

### Renaming/Removing Columns

If you rename or remove columns:

1. **Check the schema first:**
   ```bash
   curl https://oldflick.com/api/schema-check
   ```

2. If columns are removed that the API depends on:
   - Response will show missing fields
   - API will return incomplete data
   - Fix: Either add the columns back or update the schema mapping

3. **If you need to rename columns:**
   - Best approach: Keep old column name as alias
   - Or: Update the field mapping in `schema-inspector.js`

### Field Naming Conventions

The API normalizes these field names internally:

| Database Column | API Field Name | Purpose |
|---|---|---|
| `type` or `content_type` | `content_type` | 'film' or 'tv' |
| `year` or `release_year` | `release_year` | Year released |
| `duration` or `runtime_minutes` | `runtime_minutes` | Length in minutes |
| `thumbnail_url`, `backdrop_url`, or `poster_url` | `poster_url` | Image URL |
| `imdb_rating` or `rating` | `rating` | Film rating |
| `cast_members` or `actors` | `actors` | Actor list |

Any combination of these field names will work - the inspector handles the mapping.

## Preventing Unauthorized Deployments

### Git Workflow Protection

To prevent accidental or unauthorized deployments to production:

1. **Protect production branch** (in GitHub settings):
   - Require pull request reviews
   - Require status checks to pass
   - Dismiss stale reviews

2. **Require schema validation** before merging:
   - CI/CD pipeline must pass `/api/schema-check` test
   - Can't merge if schema is incompatible

3. **Audit trail**:
   - All production commits are visible in git log
   - Each commit shows author and timestamp
   - Review recent production releases: `git log production --oneline -10`

### Review Deployment History

```bash
# See who deployed what and when
git log production --oneline --decorate

# View specific deployment
git show <commit-hash>

# Compare staging vs production
git diff staging..production

# See changes in last 24 hours
git log --since="24 hours ago" production
```

## Troubleshooting

### Site crashes after deployment

**Check schema compatibility:**

```bash
# This endpoint won't require database connectivity and will show issues
curl https://oldflick.com/api/schema-check

# View server logs for schema validation errors
# Server will log: "Schema validation warnings:" + list of missing fields
```

**Rollback if critical:**

```bash
# Find stable commit
git log production --oneline | head -5

# Revert to previous commit
git revert <commit-hash>
git push origin production

# Or go back N commits
git reset --hard HEAD~1
git push -f origin production  # Force push (use carefully!)
```

### Films not loading

1. **Check schema first:**
   ```bash
   curl https://oldflick.com/api/schema-check
   ```

2. **Test API directly:**
   ```bash
   curl https://oldflick.com/api/content/14
   ```

3. **Check if required fields present:**
   ```bash
   curl https://oldflick.com/api/content/14 | grep -E '"video_url"|"content_type"|"title"'
   ```

### Supabase connection issues

```bash
# Check health endpoint
curl https://oldflick.com/api/health

# If status is "error", database connection is down
# Check Supabase status at: https://status.supabase.com
```

## Emergency Contacts & Escalation

If production is down:

1. **Check schema validation:** `/api/schema-check`
2. **View recent deployments:** `git log production --oneline -5`
3. **Rollback last commit:** `git revert HEAD && git push origin production`
4. **Wait for DigitalOcean deployment** (5-10 minutes)

## Additional Resources

- Schema Inspector: [server/db/schema-inspector.js](server/db/schema-inspector.js)
- Content API: [server/routes/content.js](server/routes/content.js)
- Health Endpoints: [server/index.js](server/index.js) - Search for `/api/health` and `/api/schema-check`

---

**Last Updated:** 2025-12-19
**Version:** 1.0
**Author:** Claude Code
