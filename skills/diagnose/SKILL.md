---
name: diagnose
description: Diagnose and fix website issues using activity logs, build logs, and version history. Use when something isn't working — the preview won't start, the site looks wrong, publishing fails, or the user reports a problem.
allowed-tools: Read, Bash, Glob, Grep, Edit, Write
user-invocable: false
---

# Diagnose and Fix Issues

Something has gone wrong. Use the logs and version history to figure out what happened and fix it. Do NOT expose technical details to the user — just fix it and explain what happened in plain language.

## Log locations

All logs live in `<site-directory>/.site-builder/logs/`:

| File | What it contains |
|---|---|
| `activity.log` | Timeline of everything: creation, updates, reverts, publishes with timestamps |
| `dev-server.log` | Dev server stdout/stderr — useful for runtime errors, port conflicts |
| `last-build.log` | Most recent `npm run build` output — useful for compile errors |
| `last-deploy.log` | Most recent SWA deploy output — useful for auth/network issues |

## Diagnosis steps

### 1. Read the activity log first
```bash
cat <site-directory>/.site-builder/logs/activity.log
```
This gives you the full timeline. Look for:
- What was the last action before things broke?
- Did a build or deploy fail (non-zero exit code)?
- What files were changed recently?

### 2. Check the relevant detailed log

**If the preview won't start or shows errors** → read `dev-server.log`:
```bash
tail -50 <site-directory>/.site-builder/logs/dev-server.log
```
Common issues: port already in use, missing dependency, syntax error in JSX.

**If publishing failed** → read `last-build.log` then `last-deploy.log`:
```bash
cat <site-directory>/.site-builder/logs/last-build.log
cat <site-directory>/.site-builder/logs/last-deploy.log
```
Common issues: import errors, missing files, invalid token, network timeout.

**If the site looks wrong after a change** → check git history:
```bash
cd <site-directory>
git log --oneline -10
git diff HEAD~1
```
This shows what changed in the last update — often reveals the bug.

### 3. Fix the issue

- If it's a code error: fix it, then log the fix
- If it's a missing dependency: `npm install <package>`
- If it's a port conflict: kill the old process or use a different port
- If it's a deploy auth issue: tell the user their publishing key may need updating
- If a recent change broke things: consider reverting to the last working version

### 4. Log the diagnosis (silently)
```bash
echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] DIAGNOSIS" >> <site-directory>/.site-builder/logs/activity.log
echo "  symptom: <what went wrong>" >> <site-directory>/.site-builder/logs/activity.log
echo "  root_cause: <what caused it>" >> <site-directory>/.site-builder/logs/activity.log
echo "  fix_applied: <what was done to fix it>" >> <site-directory>/.site-builder/logs/activity.log
```

### 5. Tell the user

Keep it simple and reassuring:
- "I found the issue — [brief non-technical explanation]. I've fixed it."
- "Everything should be working now. Check your preview to confirm."
- Never blame the user. Never say "you broke it" — say "something went wrong when..."

## How to talk to the user about problems

| What happened | What to say |
|---|---|
| Syntax error in code | "Something got tangled up in a recent change. I've fixed it — check your preview." |
| Missing dependency | "A building block was missing. I've added it — should be working now." |
| Port conflict | "Something else was using the preview. I've sorted it out — try opening the link again." |
| Build failure | "There was a hiccup preparing your site. I've tracked down the issue and fixed it." |
| Deploy auth failure | "Your publishing key doesn't seem to be working. You may need a fresh one from your admin." |
| Deploy network failure | "The publish didn't go through — seems like a connection issue. Let me try again." |
| Site looks wrong | "I see what went wrong — [explain the visible issue]. Let me fix that for you." |
