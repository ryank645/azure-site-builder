---
name: setup
description: Check all prerequisites are installed and walk the user through setting up anything missing. Run this before using any other azure-site-builder skills.
allowed-tools: Bash, Read, Glob
---

# Setup & Prerequisite Check

Walk the user through getting everything they need installed. Be friendly and patient — assume they are non-technical. Explain what each tool is and why they need it in plain language.

Run each check below. For each one, report a clear pass/fail status. If something is missing, walk them through installing it step by step before moving to the next check.

## Check 1: Node.js

```bash
node --version
```

**If missing**, tell them:
- "Node.js is what runs your website locally. Let me install it for you."
- Try: `winget install OpenJS.NodeJS.LTS`
- If winget fails, say: "Download and install Node.js from https://nodejs.org — pick the LTS version (the green button). Run the installer with all defaults, then restart your terminal and tell me to try again."
- **Required version**: 18 or higher

## Check 2: npm

```bash
npm --version
```

- This comes with Node.js. If Node is installed but npm isn't found, something went wrong with the Node install. Tell them to reinstall Node.

## Check 3: Deployment Token

Check if the deployment token is set:
```bash
echo "${SWA_DEPLOYMENT_TOKEN:-not set}"
```

**If set**, tell them: "Your deployment token is configured. You'll be able to publish your site."

**If not set**, tell them:

"To publish your site, you'll need a deployment token from your admin. Once you have it, set it up so it's always available:

**In PowerShell (recommended — persists across sessions):**
```
[System.Environment]::SetEnvironmentVariable('SWA_DEPLOYMENT_TOKEN', 'token-from-admin', 'User')
```
Then restart your terminal and run `/azure-site-builder:setup` again.

**Or in bash (current session only):**
```
export SWA_DEPLOYMENT_TOKEN=token-from-admin
```

Don't worry about this for now — you can still create and preview your site without it. You only need the token when you're ready to publish."

## Check 4: SWA CLI availability

```bash
npx @azure/static-web-apps-cli --version 2>&1
```

- This runs via npx so it doesn't need a global install. Just confirm it resolves.
- If it fails, try: `npm install -g @azure/static-web-apps-cli`
- If that also fails, there's likely a Node/npm issue — revisit Check 1.

## Summary

After all checks, show a summary table:

```
Setup Results:
  Node.js          ✅ v22.x.x
  npm              ✅ v10.x.x
  Deploy Token     ✅ Configured
  SWA CLI          ✅ v2.x.x
```

Or with issues:
```
Setup Results:
  Node.js          ✅ v22.x.x
  npm              ✅ v10.x.x
  Deploy Token     ⚠️  Not set (optional — only needed to publish)
  SWA CLI          ✅ v2.x.x
```

Then tell them:
- If all passed: "You're all set! Run `/azure-site-builder:create-site` to build your first website."
- If Node/npm passed but no token: "You can start building! Run `/azure-site-builder:create-site` to create your site. You'll need the deployment token from your admin when you're ready to publish."
- If Node/npm failed: "Fix the items above and run `/azure-site-builder:setup` again. Let me know if you need help with any step."
