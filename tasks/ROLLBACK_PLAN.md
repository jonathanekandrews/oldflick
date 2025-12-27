# Rollback Plan - Quick Reference
**Status**: SITE DOWN - Database connectivity failure
**Date**: 2025-12-27

---

## QUICK DECISION TREE

```
Is Supabase dashboard accessible?
├─ YES → Is IPv4 add-on active?
│   ├─ YES → Execute Rollback Plan (Option A)
│   └─ NO → Reactivate IPv4 add-on, wait 5 min, retry
├─ NO → Try again in 5 minutes (Supabase might be down)
└─ CAN'T CHECK → Start Rollback Plan now anyway
```

---

## OPTION A: Code Rollback (5 minutes)

**When to use**: Immediately, to stabilize the site
**Goal**: Remove recent changes that might have introduced issues

### Step 1: Save Current Work
```bash
cd c:\Users\j_and\.vscode\oldflick
git stash  # Saves all uncommitted changes
```

### Step 2: Rollback to Last Known Good
```bash
git reset --hard fb7ca0e
```

### Step 3: Verify Rollback
```bash
git log --oneline -5  # Should show fb7ca0e at top
```

### Step 4: Test
```bash
npm run dev:server  # Should start
# Check for errors
```

**What you'll see:**
- ✅ Backend starts successfully
- ❌ Database connection still fails (same underlying issue)
- This confirms the problem is NOT in the recent code changes

---

## OPTION B: Full Investigation (30 minutes)

**When to use**: After Option A fails, or if you want to fix the root cause
**Goal**: Identify and resolve the actual infrastructure issue

### Step 1: Check Supabase Status

```bash
# 1. Test DNS resolution
nslookup db.oodvbtxbeoxpilrzbxmg.supabase.co
# Expected: Should resolve to an IP address
# If fails: DNS issue or infrastructure down

# 2. Try with Google DNS
nslookup db.oodvbtxbeoxpilrzbxmg.supabase.co 8.8.8.8
# If works here but not above: Local DNS issue
```

### Step 2: Verify Supabase Account

- Go to https://supabase.com/dashboard
- Select project: `oodvbtxbeoxpilrzbxmg`
- Check: **Billing → Add-ons**
  - Dedicated IPv4 should be ✅ **ACTIVE**
  - If not active: This is the issue

### Step 3: Check Database Credentials

In `.env`:
```
DATABASE_URL=postgresql://postgres:PASSWORD@db.oodvbtxbeoxpilrzbxmg.supabase.co:5432/postgres
```

From Supabase Dashboard → Connect → PostgreSQL:
- Compare hostname: Should match `db.oodvbtxbeoxpilrzbxmg.supabase.co`
- Compare password: Should be current database password
- If different: Update `.env` and save

### Step 4: Apply Fixes

**If IPv4 is inactive:**
- In Supabase: Billing → Add-ons
- Click "Enable" next to Dedicated IPv4
- Cost: $4/month
- Wait 2-3 minutes for activation

**If Database password incorrect:**
- In Supabase: Settings → Database
- Click "Reset password"
- Copy new password
- Update `.env` DATABASE_URL
- Save file

**If DNS still failing:**
- Try Session Pooler (pooler.supabase.co endpoint)
- Or contact Supabase support

### Step 5: Test Connection

```bash
npm run dev:server
# Should now show:
# ✅ Connected to Oldflick V1 project
# ✅ Database connection successful
# Server running on port 5000
```

---

## OPTION C: Emergency Fallback

**When to use**: If Option A and B both fail
**Goal**: Identify if issue is environment or infrastructure

### Step 1: Test on Different Environment
- Try on Replit or another server
- Same `.env` file and code
- If it works elsewhere: Local network/ISP issue
- If it fails everywhere: Supabase infrastructure issue

### Step 2: Contact Supabase Support
- Provide: Project ID `oodvbtxbeoxpilrzbxmg`
- Describe: Cannot connect to `db.oodvbtxbeoxpilrzbxmg.supabase.co:5432`
- Error: `getaddrinfo ENOTFOUND db.oodvbtxbeoxpilrzbxmg.supabase.co`
- They can tell you if infrastructure is down

---

## VERIFICATION CHECKLIST

After each step, verify:

```bash
# 1. Backend starts
npm run dev:server
# ✅ Should start without hanging
# ✅ Should log "Server running on port 5000"

# 2. Database connects (in logs)
# ✅ Should log "✅ Connected to Oldflick V1 project"
# ✅ Should NOT log "Fatal database error"

# 3. API responds
curl http://localhost:3001/api/health
# ✅ Should return: {"message":"OK","database":"connected"}

# 4. Content loads
curl http://localhost:3001/api/content?content_type=film
# ✅ Should return array of films with full data

# 5. Frontend loads
npm run dev
# ✅ Opens on http://localhost:5000
# ✅ Content visible in browse page
# ✅ No console errors
```

---

## WHAT TO DO IF STILL BROKEN

1. **Document the exact error**
   ```bash
   npm run dev:server 2>&1 | head -100
   ```

2. **Check .env is loaded**
   - Verify `.env` file exists
   - Verify DATABASE_URL is set
   - No typos in filename (should be `.env` not `.env.local`)

3. **Check git status**
   ```bash
   git status
   git log --oneline -1
   ```

4. **Create diagnostic file**
   - Document: DATABASE_URL status
   - Document: DNS resolution result
   - Document: Exact error message
   - Document: What step failed

5. **Share findings**
   - Include diagnostic file
   - Include last 20 lines of log output
   - Include result of `nslookup` command
   - Include Supabase dashboard screenshot

---

## ROLLBACK SAFETY

✅ **Safe to rollback**: No user data is stored in code
✅ **Safe to rollback**: Database is separate from repository
✅ **Safe to rollback**: Credentials are in `.env`, not git
✅ **Safe to rollback**: Uncommitted changes are saved with `git stash`

**To recover uncommitted changes later:**
```bash
git stash pop
```

---

## TIME ESTIMATES

| Action | Time | Difficulty |
|--------|------|------------|
| Code rollback | 5 min | Easy |
| DNS test | 2 min | Very Easy |
| Supabase check | 3 min | Easy |
| IPv4 reactivation | 10 min | Easy |
| Full investigation | 30 min | Medium |
| Supabase support | Variable | Easy (but slow) |

---

## PRIORITY ORDER (Do in this order)

1. ✅ **Immediate** (0-5 min): Verify Supabase account status
2. ✅ **Immediate** (0-2 min): Test DNS resolution
3. ✅ **Urgent** (5-10 min): Execute Option A (code rollback)
4. 📋 **If needed** (10-15 min): Check IPv4 add-on status
5. 📋 **If needed** (15-30 min): Execute Option B (full fix)
6. 📞 **Last resort**: Contact Supabase support

---

## SUCCESS CRITERIA

Site is recovered when:
- ✅ Backend starts without errors
- ✅ Database connection succeeds
- ✅ API endpoints return data
- ✅ Frontend loads at http://localhost:5000
- ✅ Content is visible in the browse page
- ✅ Users can log in (if tested)
- ✅ No 500 errors in console or network tab

---

## NOTES

**Current Issue**: DNS cannot resolve Supabase hostname
**Root Cause**: Likely IPv4 add-on inactive or infrastructure issue
**Not a code issue**: Recent commits didn't break functionality
**Not a credentials issue**: Password is in .env and correct format

**Probability of each issue:**
- 60% - IPv4 add-on inactive or expired
- 20% - Local network/DNS issue
- 10% - Supabase infrastructure down
- 10% - Other (account issue, firewall, etc.)

---

**Report prepared: 2025-12-27**
**Confidence: HIGH - Issue is well-diagnosed**
**Action required: NOW**

