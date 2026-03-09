---
name: setup-auth
description: Admin tool to create an Azure Static Web App and generate a deployment token to give to a user. Requires Azure CLI and admin access.
allowed-tools: Bash
disable-model-invocation: true
argument-hint: [app-name]
---

# Create a Static Web App & Deployment Token (Admin Only)

This is an admin tool. It creates a new Azure Static Web App in the `claude-resources` resource group and outputs a deployment token you can give to a user. The user does NOT need Azure CLI or an Azure account — just Node.js and the token.

## Prerequisites

1. **Check the admin is logged in**:
   ```bash
   az account show
   ```
   If not, run `az login --tenant oxfordeconomics.com`.

2. **Set the subscription**:
   ```bash
   az account set --subscription 5def3d89-62c5-4b4e-afea-c447e4b321f1
   ```

## Create the Static Web App

1. **Choose an app name**:
   - Use `$ARGUMENTS` if provided
   - Otherwise ask the admin what to call it (e.g. `marketing-site`, `johns-portfolio`)
   - This name identifies the app in Azure — the public URL will be auto-generated

2. **Create the app**:
   ```bash
   az staticwebapp create \
     --name <app-name> \
     --resource-group claude-resources \
     --location "westeurope" \
     --subscription 5def3d89-62c5-4b4e-afea-c447e4b321f1 \
     --sku Free
   ```

3. **Get the deployment token**:
   ```bash
   az staticwebapp secrets list \
     --name <app-name> \
     --resource-group claude-resources \
     --subscription 5def3d89-62c5-4b4e-afea-c447e4b321f1 \
     --query "properties.apiKey" -o tsv
   ```

4. **Get the public URL**:
   ```bash
   az staticwebapp show \
     --name <app-name> \
     --resource-group claude-resources \
     --subscription 5def3d89-62c5-4b4e-afea-c447e4b321f1 \
     --query "defaultHostname" -o tsv
   ```

## Output to the admin

"Here's what to give to your user:

**Deployment Token:**
```
<token>
```

**Their site will be live at:**
```
https://<hostname>
```

**Tell the user to set up the token (one-time):**

In PowerShell:
```
[System.Environment]::SetEnvironmentVariable('SWA_DEPLOYMENT_TOKEN', '<token>', 'User')
```
Then restart their terminal.

**What the user can do with this token:**
- Deploy and update their static site
- They CANNOT create/delete other apps or access other Azure resources
- The token is scoped to this single Static Web App

**To revoke access later:**
```
az staticwebapp secrets reset-api-key --name <app-name> --resource-group claude-resources --subscription 5def3d89-62c5-4b4e-afea-c447e4b321f1
```
This invalidates the old token. You can then get a new one with `secrets list` if needed."

## List existing apps (if the admin wants to see what's already deployed)

```bash
az staticwebapp list \
  --resource-group claude-resources \
  --subscription 5def3d89-62c5-4b4e-afea-c447e4b321f1 \
  --query "[].{name:name, url:defaultHostname, location:location}" \
  -o table
```

App name: $ARGUMENTS
