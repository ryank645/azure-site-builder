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

## Check 3: Azure CLI

```bash
az --version
```

**If missing**, tell them:
- "Azure CLI is what lets you publish your site to the internet."
- Try: `winget install Microsoft.AzureCLI`
- If winget fails, say: "Download and install it from https://aka.ms/installazurecli — run the installer with all defaults, then restart your terminal and tell me to try again."

## Check 4: Azure Authentication

Check if service principal env vars are set:
```bash
echo "${AZURE_CLIENT_ID:-not set}"
echo "${AZURE_CLIENT_SECRET:-not set}"
echo "${AZURE_TENANT_ID:-not set}"
```

**If all three are set**, verify they work:
```bash
az login --service-principal \
  --username $AZURE_CLIENT_ID \
  --password $AZURE_CLIENT_SECRET \
  --tenant $AZURE_TENANT_ID 2>&1
```
- If login succeeds: "Your Azure credentials are working."
- If login fails: "Your Azure credentials didn't work. Double-check the values with your admin."

**If env vars are NOT set**, try interactive login:
```bash
az account show 2>&1
```
- If already logged in: "You're already signed into Azure."
- If not logged in, tell them:

  "You have two options to connect to Azure:

  **Option A: Your admin gave you credentials**
  Set these environment variables (ask your admin for the values):
  - In PowerShell:
    ```
    [System.Environment]::SetEnvironmentVariable('AZURE_CLIENT_ID', 'value-from-admin', 'User')
    [System.Environment]::SetEnvironmentVariable('AZURE_CLIENT_SECRET', 'value-from-admin', 'User')
    [System.Environment]::SetEnvironmentVariable('AZURE_TENANT_ID', 'value-from-admin', 'User')
    ```
  - Then restart your terminal and run `/azure-site-builder:setup` again.

  **Option B: You have an Oxford Economics Azure account**
  I'll open a browser for you to sign in:
  ```
  az login --tenant oxfordeconomics.com
  ```
  "

## Check 5: Azure Subscription Access

Only run this if auth succeeded:
```bash
az account set --subscription 5def3d89-62c5-4b4e-afea-c447e4b321f1 2>&1
```

- If it works: "You have access to the deployment subscription."
- If it fails: "You don't have access to the required Azure subscription. Ask your admin to grant you access or provide you with service principal credentials."

## Check 6: SWA CLI availability

```bash
npx @azure/static-web-apps-cli --version 2>&1
```

- This runs via npx so it doesn't need a global install. Just confirm it resolves.
- If it fails: `npm install -g @azure/static-web-apps-cli`

## Summary

After all checks, show a summary table:

```
Setup Results:
  Node.js     ✅ v22.x.x
  npm         ✅ v10.x.x
  Azure CLI   ✅ v2.x.x
  Azure Auth  ✅ Service principal / Interactive login
  Subscription ✅ Access confirmed
  SWA CLI     ✅ v2.x.x
```

Or with failures:
```
Setup Results:
  Node.js     ✅ v22.x.x
  npm         ✅ v10.x.x
  Azure CLI   ❌ Not installed — see instructions above
  Azure Auth  ⏭️  Skipped (needs Azure CLI first)
  Subscription ⏭️  Skipped (needs auth first)
  SWA CLI     ✅ v2.x.x
```

Then tell them:
- If all passed: "You're all set! Run `/azure-site-builder:create-site` to build your first website."
- If some failed: "Fix the items above and run `/azure-site-builder:setup` again. Let me know if you need help with any step."
