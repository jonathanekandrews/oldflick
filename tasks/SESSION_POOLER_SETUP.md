# Session Pooler Setup Guide

**Status**: Configuration applied, testing for password issues

---

## Problem Identified

Your Supabase project is **IPv6-only** and your Windows/VS Code environment is **IPv4-only**. The direct database connection won't work in this configuration.

### Evidence from Supabase Dashboard:
```
❌ "Not IPv4 compatible"
💡 "Purchase IPv4 add-on or use Shared Pooler if on a IPv4 network"
```

---

## Solution: Use Shared Connection Pooler

The **Shared Pooler** is:
- ✅ **Free** (included with all Supabase plans)
- ✅ **IPv4 compatible**
- ✅ **Works with existing credentials**
- ✅ **Recommended for development**

---

## Configuration Applied

### Updated `.env` File:
```env
DATABASE_URL=postgresql://postgres.oodvbtxbeoxpilrzbxmg:SC51ZAH6zz1Q5dnD@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
```

### Changes from Direct Connection:
| Property | Direct Connection | Session Pooler |
|----------|------------------|-----------------|
| **Host** | `db.oodvbtxbeoxpilrzbxmg.supabase.co` | `aws-1-eu-north-1.pooler.supabase.com` |
| **Username** | `postgres` | `postgres.oodvbtxbeoxpilrzbxmg` |
| **Password** | `SC51ZAH6zz1Q5dnD` | Same password |
| **Port** | `5432` | `5432` |
| **IPv4 Support** | ❌ No | ✅ Yes |

---

## Current Status

**Connection Tests:**
- ✅ DNS resolution works (Session Pooler hostname resolves correctly)
- ❌ Password authentication failing

**Possible Causes:**
1. Password needs to be reset in Supabase Dashboard
2. Session Pooler has cached authentication
3. New credentials required for Pooler access

---

## Next Steps

### Step 1: Reset Database Password

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Database** → **Settings**
3. Find "**Reset Database Password**" button
4. Click and confirm password reset
5. Copy the **new password**

### Step 2: Update .env

Replace the password in `.env`:
```env
DATABASE_URL=postgresql://postgres.oodvbtxbeoxpilrzbxmg:[NEW_PASSWORD]@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
```

### Step 3: Test Connection

```bash
node server/db/test-connection.js
```

Expected output:
```
✅ CONNECTION SUCCESSFUL!
   Server time: [ISO timestamp]
```

### Step 4: Restart Dev Server

```bash
npm run dev
```

The frontend and backend should now connect successfully to the database.

---

## Important Notes

- **Session Pooler** works identically to direct connections for most applications
- Connection pooling improves performance and stability
- This is the **recommended setup** for IPv4-only networks
- No code changes needed - the connection string is the only change

---

## Troubleshooting

### Still getting password auth errors?
1. Verify the password was copied correctly from Supabase
2. Check for extra spaces or characters
3. Restart the dev server after updating .env
4. Try resetting the password again if still failing

### Connection timeout?
1. Check internet connectivity
2. Verify Supabase project is active (not paused)
3. Check firewall isn't blocking port 5432

---

## Files Modified

- `c:\Users\j_and\.vscode\oldflick\.env` - Updated DATABASE_URL to use Session Pooler
- `c:\Users\j_and\.vscode\oldflick\server\db\connection.js` - Enhanced with connection pool configuration
- `c:\Users\j_and\.vscode\oldflick\server\db\test-connection.js` - Updated to test Session Pooler

---

## References

- [Supabase Pooling Documentation](https://supabase.com/docs/guides/database/api/postgres-connection-pooling)
- [IPv4 Add-on Information](https://supabase.com/docs/guides/database/ssl-enforced-connections#ipv4-connectivity)
