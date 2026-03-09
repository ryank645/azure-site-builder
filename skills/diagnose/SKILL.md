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

## Diagnosing production (live site) issues

If the user reports a problem with their published site (not the local preview), check Application Insights. This requires the admin to have set up monitoring (`/azure-site-builder:setup-monitoring`) and the user to have `APPINSIGHTS_CONNECTION_STRING` configured.

### Check if App Insights is available
```bash
echo "${APPINSIGHTS_CONNECTION_STRING:-not set}"
```

If not set, you can only diagnose using local logs and code inspection. Tell the user: "I can't see what's happening on the live site right now. Let me check the code and recent changes for anything that might cause this."

### Query App Insights via Azure CLI

The admin's App Insights resource lives in `claude-resources`. Query it using the app name (check the setup-monitoring skill output or ask the admin).

**Recent exceptions (last 24 hours)**:
```bash
az monitor app-insights query \
  --app claude-sites-appinsights \
  --resource-group claude-resources \
  --subscription 5def3d89-62c5-4b4e-afea-c447e4b321f1 \
  --analytics-query "exceptions | where timestamp > ago(24h) | order by timestamp desc | take 20 | project timestamp, type, outerMessage, innermostMessage, details" \
  --output json
```

**Recent failed requests**:
```bash
az monitor app-insights query \
  --app claude-sites-appinsights \
  --resource-group claude-resources \
  --subscription 5def3d89-62c5-4b4e-afea-c447e4b321f1 \
  --analytics-query "requests | where timestamp > ago(24h) and success == false | order by timestamp desc | take 20 | project timestamp, name, resultCode, url" \
  --output json
```

**Browser errors (client-side JavaScript errors)**:
```bash
az monitor app-insights query \
  --app claude-sites-appinsights \
  --resource-group claude-resources \
  --subscription 5def3d89-62c5-4b4e-afea-c447e4b321f1 \
  --analytics-query "browserTimings | where timestamp > ago(24h) | order by timestamp desc | take 20" \
  --output json
```

**Page view stats (is the site being used?)**:
```bash
az monitor app-insights query \
  --app claude-sites-appinsights \
  --resource-group claude-resources \
  --subscription 5def3d89-62c5-4b4e-afea-c447e4b321f1 \
  --analytics-query "pageViews | where timestamp > ago(7d) | summarize count() by name, bin(timestamp, 1d) | order by timestamp desc" \
  --output json
```

### If the query requires `az login`

The user may not have Azure CLI. In that case:
1. Check local logs and code for obvious issues
2. Check git history — did a recent change break something?
3. If you can't diagnose, say: "I can't see the live error details from here. Could you ask your admin to check the monitoring dashboard, or share a screenshot of what you're seeing?"

### Log production diagnosis
```bash
echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] PRODUCTION DIAGNOSIS" >> <site-directory>/.site-builder/logs/activity.log
echo "  reported_issue: <what the user described>" >> <site-directory>/.site-builder/logs/activity.log
echo "  appinsights_findings: <summary of what telemetry showed>" >> <site-directory>/.site-builder/logs/activity.log
echo "  root_cause: <what caused it>" >> <site-directory>/.site-builder/logs/activity.log
echo "  fix_applied: <what was done>" >> <site-directory>/.site-builder/logs/activity.log
echo "  republish_needed: <yes/no>" >> <site-directory>/.site-builder/logs/activity.log
```

If a code fix is needed, fix it, then tell the user: "I've found and fixed the issue. Say **'publish it'** to push the fix live."

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
| Live site errors (from App Insights) | "I can see some errors happening on the live site. Let me fix the issue — you'll need to publish again once I'm done." |
| Live site slow | "The live site is running a bit slow. Let me see if I can improve the performance." |
| No telemetry available | "I can't see live site diagnostics right now. Can you share a screenshot of what you're seeing?" |
