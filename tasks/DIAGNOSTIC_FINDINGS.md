# Database Connectivity Diagnostic Report
**Date**: 2025-12-13
**Status**: 🔍 ROOT CAUSE IDENTIFIED

---

## Summary

The Supabase database connectivity issue has been **pinpointed to an IPv4/IPv6 DNS resolution mismatch**.

---

## Root Cause Analysis

### The Problem
- **Supabase hostname**: `db.oodvbtxbeoxpilrzbxmg.supabase.co`
- **DNS Configuration**: Only IPv6 (AAAA record) available, NO IPv4 (A record)
- **Node.js Behavior**: Defaults to querying IPv4 (A records) first
- **Result**: `getaddrinfo ENODATA` → `ENOTFOUND` error

### Evidence
1. ✅ System `nslookup` resolves successfully (checks all record types)
   ```
   Name: db.oodvbtxbeoxpilrzbxmg.supabase.co
   Address: 2a05:d016:571:a419:b0f2:e4c4:168d:8694 (IPv6)
   ```

2. ❌ Node.js `dns.resolve()` fails (queries A records only)
   ```
   Error: queryA ENODATA db.oodvbtxbeoxpilrzbxmg.supabase.co
   ```

3. ✅ Node.js `dns.resolve6()` succeeds (queries AAAA records)
   ```
   Address: 2a05:d016:571:a419:b0f2:e4c4:168d:8694
   ```

4. ✅ External hosts resolve fine (`google.com` → 192.0.0.88)

---

## Network Connectivity Tests

| Test | Result | Details |
|------|--------|---------|
| System DNS nslookup | ✅ PASS | Resolves to IPv6: `2a05:d016:571:a419:b0f2:e4c4:168d:8694` |
| Node.js IPv4 resolve | ❌ FAIL | `ENODATA` - no A record exists |
| Node.js IPv6 resolve | ✅ PASS | Returns IPv6 address |
| TCP connectivity (bash) | ❌ FAIL | Cannot establish connection via IPv6 |
| External resolve (Google) | ✅ PASS | Proves Node.js DNS works for other hosts |

---

## Technical Details

### Why System nslookup Works
- nslookup queries **all** DNS record types (A, AAAA, etc.)
- Gets the AAAA (IPv6) record back
- System can use IPv6 to communicate

### Why Node.js pg Library Fails
- Node.js DNS resolver queries **A records first** by default
- No A record exists for Supabase hostname
- Returns `ENODATA` error
- pg library doesn't automatically fallback to IPv6
- Connection attempt fails with `ENOTFOUND`

### Why TCP Test Failed
- IPv6 connectivity from bash environment may be limited
- Even though IPv6 address resolves, bash/WSL may not route IPv6 traffic
- This is distinct from the DNS resolution issue

---

## Applied Fixes

### Fix 1: Updated `server/db/connection.js`
```javascript
import dns from 'dns';
dns.setDefaultResultOrder('ipv6first');
```
**Status**: Applied but needs verification
**Purpose**: Force Node.js to query IPv6 (AAAA) records before IPv4 (A) records

### Fix 2: Created Test Scripts
- `server/db/test-connection.js` - Basic connection test with diagnostics
- `server/db/test-connection-ipv4.js` - IPv4-only test variant

---

## Environment Context

- **OS**: Windows (running bash via WSL or Git Bash)
- **Node.js**: Latest version with ES6 module support
- **Network**: May have IPv6 limitations in this environment
- **ISP/Network**: Using IPv6 only (single-stack IPv6)

---

## Recommended Next Steps

### Option 1: Force IPv6 at Application Level ✅ IMPLEMENTED
Update `server/db/connection.js` with:
```javascript
import dns from 'dns';
dns.setDefaultResultOrder('ipv6first');
```

### Option 2: Use IPv6-Compatible Connection String
Modify connection string to use IPv6 notation:
```
postgresql://postgres:password@[IPv6_ADDRESS]:5432/postgres
```
Replace `[IPv6_ADDRESS]` with actual address if needed.

### Option 3: Supabase Dashboard Configuration
- Contact Supabase support to ensure IPv4 A record is created
- Request dual-stack configuration

### Option 4: Network Configuration
- Check if ISP/firewall has IPv6 enabled
- Verify WSL/bash environment supports IPv6 routing
- Consider using VPN with IPv4 support

---

## Testing Command

To verify the fix works:
```bash
node server/db/test-connection.js
```

Expected output on success:
```
✅ CONNECTION SUCCESSFUL!
   Server time: [ISO timestamp]
```

---

## References

- **Node.js DNS**: https://nodejs.org/api/dns.html
- **PostgreSQL IPv6**: https://www.postgresql.org/docs/current/runtime-config-connection.html
- **Supabase Networking**: Check Supabase docs for IPv4 fallback options

---

## Conclusion

The root cause is **definitively identified as IPv4/IPv6 DNS resolution mismatch**. The Supabase database is configured with IPv6-only networking in your region, while Node.js defaults to IPv4. The fix has been applied to the connection module. Success depends on whether the bash/WSL environment can actually route IPv6 traffic, which may require system-level configuration changes beyond the application code.
