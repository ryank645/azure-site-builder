---
name: deploy-site
description: Deploy a website to Azure Static Web Apps. Use when the user wants to publish their site live on the internet.
allowed-tools: Read, Bash, Glob, Grep
disable-model-invocation: true
argument-hint: [site-directory]
---

# Deploy to Azure Static Web Apps

The user wants to deploy their website to Azure Static Web Apps. This has real-world consequences (costs, public visibility), so be careful and confirm before acting.

1. **Find the site directory**:
   - If `$ARGUMENTS` is provided, use that as the site directory
   - Otherwise, look for directories containing `index.html` in the current working directory
   - Confirm with the user which site to deploy

2. **Check prerequisites**:
   - Check if Azure CLI (`az`) is installed: `az --version`
   - Check if SWA CLI is available: `npx @azure/static-web-apps-cli --version`
   - Check if user is logged in: `az account show`
   - If not logged in, guide them: "Run `az login` in your terminal first"

3. **Gather deployment info** (ask the user):
   - Resource group name (or create new)
   - App name for the Static Web App
   - Region (default: closest or uksouth)

4. **Deploy using one of these approaches**:

   **Option A: Using deployment token (if they have an existing SWA)**
   ```bash
   npx @azure/static-web-apps-cli deploy <site-directory> --deployment-token <token>
   ```

   **Option B: Create new SWA and deploy**
   ```bash
   # Create resource group (if needed)
   az group create --name <rg-name> --location <region>

   # Create Static Web App
   az staticwebapp create --name <app-name> --resource-group <rg-name> --location <region>

   # Get deployment token
   az staticwebapp secrets list --name <app-name> --resource-group <rg-name> --query "properties.apiKey" -o tsv

   # Deploy
   npx @azure/static-web-apps-cli deploy <site-directory> --deployment-token <token>
   ```

5. **After deployment**:
   - Show the user their live URL (from `az staticwebapp show`)
   - Explain: "Your site is now live! Anyone with the URL can see it."
   - Mention: "To update it later, just make changes and run `/azure-site-builder:deploy-site` again"
   - Note any costs: Azure Static Web Apps free tier includes 100GB bandwidth/month

Site directory: $ARGUMENTS
