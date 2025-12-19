# Claude Code Standards for Oldflick

## Critical Principle: VERIFY BEFORE CLAIMING

**This is non-negotiable.** Never claim a feature works, a bug is fixed, or a deployment is successful without actual verification.

---

## The Golden Rule

```
Code Change
    ↓
TEST IT
    ↓
VERIFY IT WORKS
    ↓
ONLY THEN claim success
```

**NOT:**
```
Code Change
    ↓
Claim it works
    ↓
Push to production
    ↓
(Find out it's broken)
```

---

## Verification Checklist for Every Task

### Before Declaring ANY work complete:

- [ ] **Did I actually test the change?**
- [ ] **Did I verify it works with real data?**
- [ ] **Did I test the failure case?**
- [ ] **Did I show the user proof (screenshots/test results)?**
- [ ] **Is this testable without user intervention?**

If you answer "no" to any of these, **do not claim the work is done.**

---

## Specific Verification Standards by Task Type

### 1. Database Changes

**NEVER claim a database change worked without verifying:**

```bash
# Always do this:
curl https://oldflick.com/api/content/<id>

# Check the actual response contains what you claim
# Screenshot or paste the response
# Show the user: "Here's the actual API response"
```

**Example of WRONG behavior:**
- "I deleted Sherlock Jr from the database"
- (Never checked if the database actually updated)
- (Claimed victory)
- (User finds out it still exists)

**Example of RIGHT behavior:**
- "I deleted Sherlock Jr from the database"
- Run: `curl https://oldflick.com/api/content/20`
- Paste the response showing video_url is NULL or record doesn't exist
- "Here's proof it's gone" (show screenshot)

### 2. Code Changes

**NEVER claim code changes work without verification:**

```bash
# For backend changes:
1. Read the file you changed
2. Verify the syntax is correct
3. Check that the logic does what you claim
4. If possible, test it with curl against the actual API
5. Show the user the test result

# For frontend changes:
1. Read the file you changed
2. Verify the logic is correct
3. Test on the actual site (staging or production)
4. Screenshot what it looks like
5. Show the user the result
```

**Example of WRONG behavior:**
- "I fixed the film playback issue"
- (Never tested if films actually play)
- (Claimed victory)
- (User finds out films still don't play)

**Example of RIGHT behavior:**
- "I fixed the film playback issue"
- Test: Visit https://oldflick.com/watch?id=14
- Screenshot shows: Film loads, video plays
- "Here's proof it works" (attach screenshot)

### 3. Deployment Changes

**NEVER claim a deployment worked without verification:**

```bash
# Always verify after deploying:
1. Check the health endpoint: curl https://oldflick.com/api/health
2. Check schema validation: curl https://oldflick.com/api/schema-check
3. Test a real feature: Visit homepage, click on film, try to play
4. Screenshot the working feature
5. Show the user: "Here's proof it deployed and works"
```

**Example of WRONG behavior:**
- "I deployed schema introspection"
- (Never tested if it actually deployed)
- (Claimed victory)
- (User finds out schema-check endpoint doesn't exist)

**Example of RIGHT behavior:**
- "I deployed schema introspection"
- Run: `curl https://oldflick.com/api/schema-check`
- Paste the response showing schema validation works
- "Here's proof it's deployed and working"

### 4. Git Operations

**NEVER claim a branch merge worked without verification:**

```bash
# Always verify after git operations:
1. Show the git log of what was merged
2. Verify all branches have what you claim
3. Check GitHub to confirm it pushed
4. Show the user the proof
```

**Example of WRONG behavior:**
- "I merged staging into develop"
- (Never checked if the merge actually happened)
- (Claimed victory)
- (Develop is still out of date)

**Example of RIGHT behavior:**
- "I merged staging into develop"
- Show: `git log develop -3` (displays the merged commits)
- Show: `git fetch origin && git log origin/develop -3` (confirms GitHub is updated)
- "Here's proof both are synced"

---

## Template: How to Report Completion

When you complete ANY task, format your response as:

```markdown
## Task: [Task Name]

### What I Did
- [List specific changes]
- [List specific changes]

### Verification
- Test 1: [What you tested] → [Result: PASS/FAIL]
- Test 2: [What you tested] → [Result: PASS/FAIL]
- Proof: [Screenshot/curl response/git log output]

### Status
✅ VERIFIED AND WORKING
```

**Example:**

```markdown
## Task: Delete Sherlock Jr from database

### What I Did
- Updated Supabase to set video_url to NULL for ID 20

### Verification
- Test 1: `curl https://oldflick.com/api/content/20`
- Result: Returns `"video_url": null`
- Test 2: Homepage carousel doesn't show Sherlock Jr
- Result: ✅ Confirmed with screenshot
- Proof: [Screenshot showing carousel without Sherlock Jr]

### Status
✅ VERIFIED AND WORKING
```

---

## Red Flags: When NOT to Claim Success

❌ **STOP AND VERIFY if:**
- You haven't tested the actual feature
- You haven't looked at real data
- You haven't visited the actual website
- You haven't run an actual curl command
- You're assuming something works without proof
- You're claiming multiple features work but only coded one
- You're saying "it should work" instead of "I verified it works"
- You haven't shown the user any proof

---

## The Cost of Not Verifying

This is what happens when you don't verify:

1. **User trusts your claim** - "Claude fixed the issue"
2. **Code gets deployed to production**
3. **User tests it** - "It's still broken"
4. **Trust is lost** - "I can't trust anything you say"
5. **Time is wasted** - Debugging false fixes
6. **Frustration** - Both sides frustrated

**Verification prevents all of this.**

---

## Mandatory Testing for Each Feature Type

### Films/Content Playback
- [ ] Tested: Homepage loads without errors
- [ ] Tested: Film can be selected and watch page loads
- [ ] Tested: Video player appears
- [ ] Tested: Play button works (at least starts playing)
- [ ] Tested: No console errors
- [ ] Proof: Screenshot of working player

### API Endpoints
- [ ] Tested: Endpoint returns data (not 404 or 500)
- [ ] Tested: Data format is correct (fields present)
- [ ] Tested: Data is complete (not null/empty unexpectedly)
- [ ] Proof: curl response output

### Database Operations
- [ ] Tested: Change actually made it to database
- [ ] Tested: Query returns expected result
- [ ] Tested: No side effects on other records
- [ ] Proof: curl response showing the data

### Deployments
- [ ] Tested: Code deployed to correct branch
- [ ] Tested: Health endpoint responds
- [ ] Tested: New code is live (not old cached version)
- [ ] Proof: curl output showing current state

---

## How to Verify When You Can't Test Directly

When you can't directly access the server:

1. **Use curl commands** - These are your eyes into the API
2. **Read the code** - Verify the logic is correct
3. **Check git logs** - Verify the code is deployed
4. **Get user feedback** - Ask the user to test and report back
5. **Show your work** - Explain exactly what you tested

**DO NOT assume things work without testing somehow.**

---

## The Three-Level Verification

### Level 1: Code Review (Minimum)
- Read what you changed
- Verify syntax and logic are correct
- Check for obvious errors

### Level 2: API Testing (Better)
- Use curl to test endpoints
- Verify responses are as expected
- Check edge cases

### Level 3: End-to-End Testing (Best)
- Test the actual feature in browser
- Try all user paths
- Screenshot the working feature
- Show user the proof

**Always aim for Level 3 when possible.**

---

## What To Do If You Can't Verify

If you genuinely cannot verify something (e.g., you don't have production access):

**SAY SO EXPLICITLY:**

```markdown
## Task: Deploy schema validation

### What I Did
- [List changes]

### Verification Status
⚠️ CANNOT FULLY VERIFY - Need user testing

I cannot directly test the deployment because:
- The server is remote and I don't have direct access
- The feature requires user interaction to fully test

### What You Should Test
1. Visit https://oldflick.com/api/schema-check
2. Confirm it returns valid schema information
3. Try playing a film and confirm it works
4. Report back if you see any errors

### What I Can Verify
- Code syntax is correct
- Logic appears sound
- Code is deployed to GitHub

### Status
✅ Code verified correct
⏳ Awaiting user testing for full verification
```

This is honest and tells the user exactly what they need to do.

---

## Bottom Line

**Every single claim you make must be backed by verification.**

If you can't verify it:
- Don't claim it works
- Tell the user what needs to be tested
- Ask them for feedback
- Verify once you get their report

This prevents wasted time, lost trust, and frustration.

---

**Last Updated:** 2025-12-19
**Status:** CRITICAL - Must be followed on every task
**Purpose:** Ensure reliability and user trust
