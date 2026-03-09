---
name: preview-site
description: Preview a website locally using the Azure Static Web Apps CLI emulator. Use when the user wants to see their site before deploying.
allowed-tools: Read, Bash, Glob
argument-hint: [site-directory]
---

# Preview Website Locally

The user wants to preview their website locally before deploying.

1. **Find the site directory**:
   - If `$ARGUMENTS` is provided, use that as the site directory
   - Otherwise, look for directories containing `index.html` in the current working directory
   - If multiple candidates exist, ask the user which one

2. **Check prerequisites**:
   - Check if `swa` CLI is installed: `npx @azure/static-web-apps-cli --version`
   - If not available, tell the user: "I'll use the SWA CLI to preview. Installing it temporarily via npx."

3. **Start the preview**:
   ```bash
   npx @azure/static-web-apps-cli start <site-directory>
   ```
   - Run this in the background so the user can interact
   - Tell them the local URL (typically http://localhost:4280)

4. **Explain to the user**:
   - "Your site is now running locally at http://localhost:4280"
   - "Open that URL in your browser to see it"
   - "When you're done previewing, press Ctrl+C or tell me to stop it"
   - "Ready to go live? Use `/azure-site-builder:deploy-site`"

Site directory: $ARGUMENTS
