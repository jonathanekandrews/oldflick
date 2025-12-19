# Production Push Protection - Passcode System

## Overview

This system requires a **passcode** before any code can be pushed to the **production branch only**. This prevents accidental or unauthorized deployments to production.

**IMPORTANT:** This protection only applies to **production**. The **staging** branch is freely deployable for testing.

## How It Works

### 1. Pre-Push Hook

When you attempt to `git push origin production`, a **pre-push hook** intercepts the push and:

1. Detects that you're pushing to production
2. Displays the commits being pushed
3. Prompts you to enter the deployment passcode
4. Verifies the schema compatibility
5. Only allows the push if passcode is correct

### 2. Workflow

```
Your Machine (Local)
    ↓
git push origin production
    ↓
Pre-push hook triggers (PRODUCTION ONLY)
    ↓
Prompt for passcode
    ↓
    ├─ Passcode incorrect → ❌ PUSH BLOCKED
    │
    └─ Passcode correct → ✅ Push allowed
        ↓
        Schema verification
        ↓
        GitHub receives push
        ↓
        Deployment triggered
```

### 3. Staging is Unprotected

```
git push origin staging
    ↓
Hook runs but detects "staging" branch
    ↓
No passcode required
    ↓
Push allowed immediately
    ↓
Staging deployed
```

## Current Passcode

```
oldflick-deploy-2025
```

**⚠️ IMPORTANT:** Change this passcode regularly and share it only with authorized team members.

## Using the System

### Pushing to Production (Protected)

```bash
# Make your commits to production branch
git add .
git commit -m "fix: Some production fix"

# Push to production
git push origin production

# You will be prompted:
# 🔐 PRODUCTION PUSH PROTECTION
# ═══════════════════════════════════════════════════════════════
#
# Branch: production
# ⚠️  DEPLOYING TO PRODUCTION
#
# Last 3 commits being pushed:
#   abc1234 docs: Update README
#   def5678 fix: Bug fix
#   ghi9012 feat: New feature
#
# Enter deployment passcode: _
```

### Pushing to Staging (Unprotected)

```bash
# Push to staging
git push origin staging

# No prompt - deployed immediately
# This is the entire output:
# Counting objects: 5, done.
# Delta compression using up to 8 threads
# Compressing objects: 100% (3/3), done.
# ...
```

## Entering the Passcode

### When pushing to production:

```bash
# Type the passcode and press Enter
Enter deployment passcode: oldflick-deploy-2025

# If correct:
# ✅ Passcode verified - proceeding with production push
# 🔍 Verifying schema compatibility...
# ✅ Schema inspector module present
# ✅ All checks passed - pushing to production

# If incorrect:
# ❌ PASSCODE INCORRECT - Push to production BLOCKED
```

## Changing the Passcode

### When to Change

- Quarterly security review
- When team members leave
- After a suspected breach
- Any time you feel the code is compromised

### How to Change

1. Edit `.husky/pre-push` (on production branch only)
2. Find this line:
   ```bash
   CORRECT_PASSCODE="oldflick-deploy-2025"
   ```
3. Replace with new passcode:
   ```bash
   CORRECT_PASSCODE="your-new-passcode"
   ```
4. Commit and push to production (use old passcode):
   ```bash
   git add .husky/pre-push
   git commit -m "chore: Update production passcode"
   git push origin production
   # When prompted, enter old passcode to authorize the change
   ```
5. Distribute new passcode to authorized team members

## What Gets Checked

### Pre-Push Safety Checks (Production Only)

✅ Branch name is "production"
✅ Displays last 3 commits being pushed
✅ Verifies schema-inspector module exists
✅ Requires correct passcode to proceed

### Staging Branch

No checks - freely deployable for testing purposes

## Bypassing the Hook (Emergency Only)

**IMPORTANT:** Only use in emergencies when the hook is malfunctioning.

### Method 1: Force Push (Not Recommended)

```bash
git push --no-verify origin production
```

⚠️ This skips ALL pre-push hooks and safety checks. Use with extreme caution.

### Method 2: Disable Hook Temporarily

```bash
# Temporarily disable the pre-push hook
mv .husky/pre-push .husky/pre-push.disabled

# Make your push
git push origin production

# Re-enable the hook
mv .husky/pre-push.disabled .husky/pre-push
```

⚠️ Make sure to re-enable the hook immediately after.

## Troubleshooting

### "Hook not running" / No passcode prompt

**Cause:** Husky hooks not installed locally

**Solution:**
```bash
# Install Husky hooks
git config core.hooksPath .husky

# Or reinstall:
npx husky install
```

### "Command not found: read"

**Cause:** Shell compatibility issue (Windows PowerShell)

**Solution:** Use Git Bash instead:
```bash
# Use Git Bash (included with Git for Windows)
bash
git push origin production
```

### Need to bypass hook for testing

```bash
# Skip hook for this push only
git push --no-verify origin production

# Hook is still in place, just --no-verify bypasses it
```

## Team Guidelines

### Only Authorized Personnel Should Have Passcode

1. Product/Project Lead
2. Senior Developer
3. DevOps/Infrastructure Lead

### Deployment Process

1. **Developer** creates PR on develop/staging
2. **Code Review** - Team reviews changes
3. **QA Testing** - Verify on staging
4. **Authorized Person** merges to production with passcode
5. **Automated Deployment** - DigitalOcean deploys

### Audit Trail

Every push is logged in Git history:

```bash
# See all production pushes
git log production --oneline

# See who pushed what and when
git log production --format="%h %an %ai %s"

# See specific push
git show <commit-hash>
```

## GitHub Branch Protection (Recommended)

For additional security, also set up GitHub branch protection on production:

1. Go to GitHub → Repository Settings → Branches
2. Add rule for `production` branch
3. Require:
   - ✅ Pull request reviews before merging
   - ✅ Status checks to pass (CI/CD)
   - ✅ Dismiss stale pull request approvals
   - ✅ Restrict who can push to production

This combined with the local passcode hook provides defense-in-depth.

## Security Best Practices

### ✅ DO

- Change passcode regularly (quarterly minimum)
- Share passcode securely (not in Slack/email)
- Log all production deployments
- Require code review before production push
- Run schema validation before deploying
- Keep .husky configuration in version control
- Test on staging before pushing to production

### ❌ DON'T

- Share passcode in plain text channels
- Use simple/guessable passcodes
- Commit passcode changes without review
- Bypass hook for routine deployments
- Allow unauthorized access to production branch
- Store passcode in environment files
- Deploy directly to production without staging

## Example Scenario

### Scenario 1: Accidental Production Push

**What happens:**

```bash
# Developer accidentally tries to push to production
$ git push origin production

# Pre-push hook kicks in (only for production):
# 🔐 PRODUCTION PUSH PROTECTION
# ═══════════════════════════════════════════
# ⚠️  This is a PRODUCTION push!
# Enter deployment passcode: incorrect_password
# ❌ PASSCODE INCORRECT - Push to production BLOCKED

# Push prevented - developer realizes mistake
# Developer switches to correct branch instead
$ git checkout staging
```

**Result:** Accidental production deployment prevented ✅

### Scenario 2: Staging Deployment (No Protection)

**What happens:**

```bash
# Developer pushes to staging for testing
$ git push origin staging

# Hook runs but detects "staging" branch
# No passcode required
# Push succeeds immediately
# Staging deploys without delay

# Perfect for rapid testing and iteration
```

**Result:** Staging freely deployable for testing ✅

## Monitoring Deployments

Track who deployed what and when:

```bash
# Recent production commits
git log production --oneline -10

# Detailed deployment history
git log production --format="%h | %an | %ai | %s" --graph

# Compare with staging
git diff staging..production

# See what changed in last deployment
git show production
```

---

**System Implemented:** 2025-12-19
**Current Passcode:** `oldflick-deploy-2025`
**Protection Scope:** Production branch only
**Status:** Active ✅
