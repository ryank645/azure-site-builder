---
name: deploy-site
description: Publish the website live on the internet. Use when the user is happy with their site and wants to make it public.
allowed-tools: Read, Bash, Glob, Grep
disable-model-invocation: true
argument-hint: [site-directory]
---

# Publish the Website

The user wants to put their website live on the internet. Keep the language simple — they don't need to know about build processes, deployment tokens, or Azure.

## How to talk to the user

- Say "publish" not "deploy"
- Say "your website is live" not "deployment succeeded"
- Say "building your website for publishing" not "running npm build"
- Say "publishing key" not "deployment token"
- Don't mention Azure, SWA, or any infrastructure details

## Step 1: Find the site

- If `$ARGUMENTS` is provided, use that directory
- Otherwise, look for React projects (directories with `package.json` + `src/`)
- If multiple exist, ask: "Which website do you want to publish?" and list them by name

## Step 2: Check for publishing key

```bash
echo "${SWA_DEPLOYMENT_TOKEN:-not set}"
```

**If not set**, say:
"To publish your website, I need a publishing key. Your admin should have given you one.

If you have it, you can either:
- **Paste it here** and I'll use it now
- **Set it up permanently** so you don't have to paste it each time — run this in PowerShell:
  ```
  [System.Environment]::SetEnvironmentVariable('SWA_DEPLOYMENT_TOKEN', 'paste-your-key-here', 'User')
  ```
  Then restart this chat.

If you don't have a key yet, ask your admin to set one up for you."

If the user pastes a token, use it directly. Do NOT write it to any file.

## Step 3: Save, build, and publish

All silently — don't mention logging, snapshots, or build output to the user.

```bash
cd <site-directory>
mkdir -p .site-builder/logs
git add -A
git diff --cached --quiet || git commit -m "Pre-publish snapshot"
```

**Build and capture output**:
```bash
cd <site-directory>
echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] PUBLISH STARTED" >> .site-builder/logs/activity.log
npm run build 2>&1 | tee .site-builder/logs/last-build.log
echo "  build_exit_code: $?" >> .site-builder/logs/activity.log
```

If the build fails, read `.site-builder/logs/last-build.log` to diagnose the issue before telling the user. Fix the code and retry.

**Deploy and capture output**:
```bash
cd <site-directory>
npx @azure/static-web-apps-cli deploy ./dist \
  --deployment-token $SWA_DEPLOYMENT_TOKEN \
  --env production 2>&1 | tee .site-builder/logs/last-deploy.log
echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] PUBLISH COMPLETED" >> .site-builder/logs/activity.log
echo "  deploy_exit_code: $?" >> .site-builder/logs/activity.log
```

If the deploy fails, read `.site-builder/logs/last-deploy.log` to diagnose before telling the user.

## Step 4: Tell the user

"Your website is live! It may take a minute or two to fully update.

To make changes later, just tell me what you'd like to update — I'll make the changes, and when you're ready, say **'publish it'** again to push the updates live."

## If something goes wrong

| What happened | What to say |
|---|---|
| Token invalid / 401 | "Your publishing key doesn't seem to be working. It may have been changed — ask your admin for a new one." |
| Build failed | "Something went wrong while preparing your website. Let me take a look and fix it." (Then investigate the build error and fix the code.) |
| Network timeout | "The publish didn't go through — this sometimes happens. Let me try again." |

Site directory: $ARGUMENTS
