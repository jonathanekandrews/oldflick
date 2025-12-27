# Neon Connection Configuration Guide
**Project**: Oldflick Streaming Platform
**Database**: Neon PostgreSQL
**Date**: 2025-12-27

---

## QUICK START

### Get Your Neon Connection String

1. Go to https://console.neon.tech
2. Sign in to your Neon account
3. Select your project: **oldflick-production**
4. Click **Connection string** button
5. Copy the PostgreSQL connection string
6. Format: `postgresql://user:password@project.neon.tech/postgres?sslmode=require`

### Update Your Application

```bash
# 1. Edit .env file
nano .env

# 2. Find this line:
# DATABASE_URL=postgresql://postgres:***@db.oodvbtxbeoxpilrzbxmg.supabase.co:5432/postgres

# 3. Replace with your Neon connection string:
# DATABASE_URL=postgresql://neon_user:password@oldflick.neon.tech/postgres?sslmode=require

# 4. Save file (Ctrl+X, then Y, then Enter if using nano)

# 5. Test connection
npm run dev:server
```

---

## DETAILED CONNECTION SETUP

### Step 1: Create Neon Account

1. Visit https://neon.tech
2. Click "Get Started" or "Sign Up"
3. Create account with:
   - Email: Your development email
   - Password: Strong password
   - Verify email
4. You'll be in Neon dashboard automatically

---

### Step 2: Create Project

1. Dashboard shows "Create Project" button
2. Click **"Create a new project"**
3. Fill in:
   - **Name**: oldflick-production
   - **Region**: US East (default, good for most users)
   - **Postgres Version**: Latest (15+)
   - **Database**: postgres (default)
4. Click **"Create project"**
5. Wait 30 seconds for project to initialize

---

### Step 3: Get Connection String

#### Method A: From Dashboard (Recommended)

1. Project is now created
2. See the **"Connection string"** tab at top
3. Toggle **"Pooled connection"** OFF (not needed for simple apps)
4. Copy entire string:
   ```
   postgresql://user:password@oldflick.neon.tech/postgres?sslmode=require
   ```
5. Note: Password is long (20+ characters) - copy carefully

#### Method B: Using Neon CLI

```bash
# Install Neon CLI (optional, for advanced users)
npm install -g @neondatabase/neon-cli

# Login
neonctl auth

# Get connection string
neonctl connection-string --project-name oldflick-production

# Output example:
# postgresql://neon_user:abc123xyz@oldflick.neon.tech/postgres?sslmode=require
```

---

### Step 4: Update Application Configuration

#### File: `.env`

```bash
# BEFORE (Supabase)
DATABASE_URL=postgresql://postgres:DmlShroLZ5Dw61j5@db.oodvbtxbeoxpilrzbxmg.supabase.co:5432/postgres

# AFTER (Neon)
DATABASE_URL=postgresql://neon_user:AbCdEfGhIjKlMnOpQrStUvWxYz123@oldflick.neon.tech/postgres?sslmode=require
```

**Important notes about the connection string:**
- `neon_user` - Default user created with project
- `AbCdEfGh...` - Long random password (don't lose it!)
- `oldflick.neon.tech` - Your project domain
- `postgres` - Default database name (don't change)
- `?sslmode=require` - **REQUIRED** for security

#### Backup Old Configuration

```bash
# Save Supabase config in case you need to rollback
cp .env .env.backup.supabase
```

---

### Step 5: Verify Connection

```bash
# Test that .env is loaded and connection works
npm run dev:server

# Expected output:
# 🔍 ===== DATABASE CONNECTION VALIDATION =====
# Timestamp: 2025-12-27T...
# 📋 Environment Variables:
#   DATABASE_URL: postgresql://neon_user:***@oldflick.neon.tech/postgres
#   NODE_ENV: production
# 🌐 Database Host:
#   Parsed: oldflick.neon.tech
#   ✅ Connected to Neon PostgreSQL
# 🔌 Testing Database Connection...
# ✅ Database connection successful
# Server running on port 5000
```

If you see errors, check:
1. Connection string is exactly correct (no spaces, no typos)
2. Neon project is running (check Neon dashboard)
3. Network allows outbound connections to neon.tech
4. `.env` file is in correct location

---

## CONFIGURATION FOR DIFFERENT ENVIRONMENTS

### Development Environment

```bash
# .env (local machine)
DATABASE_URL=postgresql://neon_user:password@oldflick.neon.tech/postgres?sslmode=require
NODE_ENV=development
API_PORT=3001
```

**Connection pool settings in `server/db/connection.js`:**

```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,                    // Dev: Can use more connections
  idleTimeoutMillis: 30000,   // 30 second idle timeout
  connectionTimeoutMillis: 10000
});
```

### Production Environment

```bash
# .env (production server)
DATABASE_URL=postgresql://neon_user:password@oldflick.neon.tech/postgres?sslmode=require
NODE_ENV=production
API_PORT=5000
```

**Connection pool settings in `server/db/connection.js`:**

```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,                    // Prod: Use connection pooler for better performance
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});
```

---

## ADVANCED: CONNECTION POOLING

### When to Use Connection Pooling

Neon connection pooling helps when:
- You have many simultaneous users
- Database connections are slow or timing out
- You're using serverless functions (Vercel, etc.)

### Enable Neon Connection Pooler

1. In Neon dashboard, select your project
2. Go to **Connection pooling**
3. **Pool mode**: PgBouncer (default is good)
4. **Pool size**: 10 (reasonable default)
5. Copy **Pooled connection string**

**Connection string with pooler:**
```
postgresql://neon_user:password@oldflick.neon.tech/postgres?sslmode=require&pool_mode=transaction
```

**Update `server/db/connection.js`:**

```javascript
// Use pooled connection for production
const poolerUrl = process.env.NODE_ENV === 'production'
  ? process.env.DATABASE_POOLER_URL  // Add DATABASE_POOLER_URL to .env
  : process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: poolerUrl,
  ssl: { rejectUnauthorized: false },
  max: 5,  // Use fewer local connections when pooling
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});
```

**.env with pooler:**
```
DATABASE_URL=postgresql://neon_user:password@oldflick.neon.tech/postgres?sslmode=require
DATABASE_POOLER_URL=postgresql://neon_user:password@oldflick.neon.tech/postgres?sslmode=require&pool_mode=transaction
```

---

## AUTOMATIC BACKUPS

Neon automatically backs up your database. To restore from backup:

1. In Neon dashboard, go to **Backups**
2. Select desired backup point
3. Click **Restore** (creates new project)
4. Update connection string if restoring to new project
5. Verify data integrity

**Backup retention**: 30 days (free plan)

---

## DATABASE RESET

If you need to completely reset the database:

### Option 1: Drop and Recreate Tables

```bash
psql "$DATABASE_URL" -c "
  DROP TABLE IF EXISTS user_lists;
  DROP TABLE IF EXISTS users;
  DROP TABLE IF EXISTS content;
"

# Then reapply schema
psql "$DATABASE_URL" -f server/db/schema.sql
```

### Option 2: Neon Dashboard Reset

1. Go to Neon dashboard
2. Click your project
3. Go to **Branch**
4. Click **Reset data** (deletes all data, keeps schema)
5. Or **Delete branch** and create new one

### Option 3: Full Project Delete and Recreate

1. Go to Neon dashboard
2. Click your project
3. Go to **Settings**
4. Click **Delete project**
5. Confirm with project name
6. Create new project
7. Update connection string

---

## COMMON CONNECTION ISSUES

### Issue 1: Connection Refused

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Cause**: Connection string doesn't have `@oldflick.neon.tech` domain

**Fix**:
```bash
# WRONG:
DATABASE_URL=postgresql://user:password@localhost/postgres

# CORRECT:
DATABASE_URL=postgresql://neon_user:password@oldflick.neon.tech/postgres?sslmode=require
```

### Issue 2: SSL Errors

**Error:**
```
Error: Error: ENOENT: no such file or directory, open '/path/to/ca.pem'
```

**Cause**: SSL configuration is set to require cert files

**Fix** in `server/db/connection.js`:
```javascript
// WRONG:
ssl: {
  rejectUnauthorized: true,
  ca: fs.readFileSync('/path/to/ca.pem')
}

// CORRECT:
ssl: { rejectUnauthorized: false }
```

### Issue 3: Host Not Found

**Error:**
```
Error: getaddrinfo ENOTFOUND oldflick.neon.tech
```

**Cause**:
1. Typo in domain name, or
2. Network can't resolve Neon domain

**Fix**:
```bash
# Verify connection string
echo $DATABASE_URL

# Test DNS resolution
nslookup oldflick.neon.tech
# Should show IP address

# Test connection with psql
psql "postgresql://neon_user:password@oldflick.neon.tech/postgres?sslmode=require" -c "SELECT version();"
```

### Issue 4: Authentication Failed

**Error:**
```
Error: password authentication failed for user "neon_user"
```

**Cause**: Password is wrong or contains special characters not properly escaped

**Fix**:
1. Go to Neon dashboard
2. Click project → **Settings**
3. Under **Connection string**, copy fresh password
4. Update `.env` with exact password
5. If password has special characters, URL-encode them (e.g., `@` → `%40`)

### Issue 5: Database Doesn't Exist

**Error:**
```
FATAL: database "oldflick" does not exist
```

**Cause**: Connection string references wrong database name

**Fix**:
```bash
# Connection string should use 'postgres' database (default):
DATABASE_URL=postgresql://neon_user:password@oldflick.neon.tech/postgres?sslmode=require

# NOT:
DATABASE_URL=postgresql://neon_user:password@oldflick.neon.tech/oldflick?sslmode=require
```

---

## TESTING YOUR CONNECTION

### Test 1: Using psql Command Line

```bash
# Set connection string
NEON_URL="postgresql://neon_user:password@oldflick.neon.tech/postgres?sslmode=require"

# Test connection
psql "$NEON_URL" -c "SELECT version();"

# Expected output:
# PostgreSQL 15.2 on ... (Neon)
```

### Test 2: Using Node.js

```bash
# Create test file
cat > test-connection.js << 'EOF'
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT version()', (err, result) => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Connection successful:');
  console.log('  ', result.rows[0].version);
  process.exit(0);
});
EOF

# Run test
node test-connection.js
```

### Test 3: Using Application

```bash
# Start backend
npm run dev:server

# In another terminal, test API
curl http://localhost:3001/api/health

# Expected:
# {"message":"OK","database":"connected"}
```

---

## MONITORING AND METRICS

### Check Database Size

```bash
psql "$DATABASE_URL" -c "
  SELECT
    pg_size_pretty(pg_database_size(current_database())) as database_size
"

# Example output:
# database_size
# -------
# 8 MB
```

### Monitor Connections

```bash
psql "$DATABASE_URL" -c "
  SELECT
    count(*) as active_connections,
    state
  FROM pg_stat_activity
  GROUP BY state
"

# Example output:
# active_connections | state
# ---+-------
# 2 | active
# 3 | idle
```

### Monitor Query Performance

```bash
# Slow queries (taking > 1 second)
psql "$DATABASE_URL" -c "
  SELECT
    mean_exec_time,
    calls,
    query
  FROM pg_stat_statements
  WHERE mean_exec_time > 1000
  ORDER BY mean_exec_time DESC
  LIMIT 10
"
```

---

## NEON DASHBOARD OVERVIEW

### Main Sections

**Projects**
- List of all projects
- Click to select project

**Connection string**
- Direct connection string (for psql)
- Pooled connection string (for apps)
- Copy buttons for easy access

**Databases**
- List of databases in project
- Option to create new databases

**Roles**
- User accounts and permissions
- Default: neon_user (full access)

**Branches**
- Project versions/snapshots
- Restore from backups
- Create development branches

**Settings**
- Project name and region
- Connection limits
- Billing information

**Monitoring**
- Database size
- Active connections
- Recent activity

---

## ENVIRONMENT VARIABLES REFERENCE

### Essential (Required)

```bash
# Database connection
DATABASE_URL=postgresql://neon_user:password@oldflick.neon.tech/postgres?sslmode=require
```

### Optional (Application-specific)

```bash
# For connection pooling (advanced)
DATABASE_POOLER_URL=postgresql://neon_user:password@oldflick.neon.tech/postgres?sslmode=require&pool_mode=transaction

# Application settings
NODE_ENV=production
API_PORT=5000

# Supabase (if still using for storage/auth)
SUPABASE_URL=https://oodvbtxbeoxpilrzbxmg.supabase.co
SUPABASE_ANON_KEY=eyJ...

# Stripe (payment processing)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## SECURITY BEST PRACTICES

1. **Never commit `.env` to git**
   ```bash
   # Verify .env is in .gitignore
   grep ".env" .gitignore
   ```

2. **Use strong passwords**
   - Neon generates 20+ character passwords
   - Don't try to "simplify" them

3. **Keep connection string private**
   - Don't share in emails
   - Don't paste in chat
   - Use secure password managers

4. **Enable HTTPS on application**
   - Connection string will be transmitted
   - HTTPS encrypts it in transit

5. **Use separate projects for dev/prod**
   - Development: Can share credentials
   - Production: Restricted access

6. **Rotate credentials regularly**
   - Every 90 days recommended
   - Neon dashboard allows password reset

---

## MIGRATION FROM SUPABASE

### Step 1: Get Both Connection Strings

```bash
# From .env.backup.supabase
SUPABASE_URL=postgresql://postgres:password@db.oodvbtxbeoxpilrzbxmg.supabase.co:5432/postgres

# From Neon dashboard
NEON_URL=postgresql://neon_user:password@oldflick.neon.tech/postgres?sslmode=require
```

### Step 2: Export Data from Supabase

```bash
# See NEON_DATA_MIGRATION.md for complete instructions
pg_dump "$SUPABASE_URL" > backup.sql
```

### Step 3: Import Data to Neon

```bash
# Apply schema
psql "$NEON_URL" -f server/db/schema.sql

# Import data
psql "$NEON_URL" < backup.sql
```

### Step 4: Update Configuration

```bash
# Update .env
DATABASE_URL=$NEON_URL

# Restart application
npm run dev:server
```

### Step 5: Keep Supabase as Fallback

```bash
# Keep for 30 days in case rollback needed
# Keep connection string in .env.backup.supabase
# Check Supabase settings to see if IPv4 add-on is active
```

---

## CHECKLIST: NEON CONNECTION SETUP

```
Account Setup
[ ] Neon account created
[ ] Email verified
[ ] Payment method added (optional, free plan available)

Project Setup
[ ] Project created: oldflick-production
[ ] Region selected: US East
[ ] Database created: postgres
[ ] Project status: Running

Connection String
[ ] Copied from Neon dashboard
[ ] Format: postgresql://user:password@...?sslmode=require
[ ] Contains: neon_user
[ ] Contains: oldflick.neon.tech
[ ] Contains: sslmode=require

Application Configuration
[ ] .env file updated with new DATABASE_URL
[ ] Old .env backed up
[ ] No spaces in connection string
[ ] No special characters unescaped

Testing
[ ] psql connection test successful
[ ] Node.js test-connection.js successful
[ ] npm run dev:server starts without errors
[ ] API health endpoint returns OK
[ ] Content API returns 7 records

Verification
[ ] Tables created in Neon
[ ] Data loaded successfully
[ ] Indexes present
[ ] Foreign keys working
[ ] No error logs

Documentation
[ ] Connection string documented securely
[ ] Neon dashboard bookmarked
[ ] Backup recovery procedure documented
[ ] Team notified of new database
```

---

## NEXT STEPS

1. **Complete Setup** → Follow steps above
2. **Test Thoroughly** → Use test commands to verify
3. **Deploy** → Update production with new connection string
4. **Monitor** → Check Neon dashboard for 24 hours
5. **Archive** → Keep Supabase credentials for 30 days

---

**Configuration guide version**: 1.0 (2025-12-27)
**For Neon project**: oldflick-production
**Last updated**: 2025-12-27

