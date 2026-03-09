---
name: setup-auth
description: Admin tool to provision Azure resources and onboard users. Creates monitoring, Static Web Apps, and generates user credentials. Run this to set up a new user or site.
allowed-tools: Bash
disable-model-invocation: true
argument-hint: [site-name]
---

# Admin Setup

Run the admin setup script. This handles everything:
- Verifies Azure CLI and login
- Creates shared monitoring (App Insights + Log Analytics) — skips if already exists
- Creates a new Static Web App for the user
- Outputs the exact PowerShell commands to give to the user

## Run the script

```bash
cd ${CLAUDE_SKILL_DIR}/../../scripts
npx tsx admin-setup.ts
```

The script is interactive — it will prompt for a site name and handle the rest.

If `$ARGUMENTS` is provided, pass it as context: the user wants to create a site called `$ARGUMENTS`.
After the script runs, relay the user instructions output to the admin.
