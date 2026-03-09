---
name: deploy-site
description: Build and deploy the React website to Azure Static Web Apps. Use when the user wants to publish their site live on the internet.
allowed-tools: Read, Bash, Glob, Grep
disable-model-invocation: true
argument-hint: [site-directory]
---

# Deploy to Azure Static Web Apps

The user wants to publish their React site. This uses a deployment token — no Azure CLI needed on the user's machine.

## Step 1: Find the site directory

- If `$ARGUMENTS` is provided, use that as the site directory
- Otherwise, look for React projects (directories with `package.json` + `src/`) in the current working directory
- Confirm with the user which site to deploy

## Step 2: Check for deployment token

```bash
echo "${SWA_DEPLOYMENT_TOKEN:-not set}"
```

**If not set**, ask the user:

"I need your deployment token to publish the site. You have two options:

1. **If your admin gave you a token**, paste it here and I'll use it for this session. To make it permanent, run this in PowerShell:
   ```
   [System.Environment]::SetEnvironmentVariable('SWA_DEPLOYMENT_TOKEN', 'your-token', 'User')
   ```

2. **If you don't have a token**, ask your admin to run `/azure-site-builder:setup-auth` to create one for you."

If the user pastes a token, store it in a variable for use in the deploy command below. Do NOT write it to any file.

## Step 3: Build the React app

```bash
cd <site-directory>
npm run build
```

This creates the static output in `dist/`.

## Step 4: Deploy

```bash
cd <site-directory>
npx @azure/static-web-apps-cli deploy ./dist \
  --deployment-token $SWA_DEPLOYMENT_TOKEN \
  --env production
```

If the user pasted a token instead of using the env var, substitute it directly in the command.

## Step 5: Tell the user

- "Your site is live! It may take a minute to update."
- "To find your URL, ask your admin or check your setup notes."
- "To update your site later, just make changes and run `/azure-site-builder:deploy-site` again."
- "The site updates every time you deploy — no extra steps needed."

## Troubleshooting

- **"401 Unauthorized"**: The deployment token is wrong or has been revoked. Ask admin for a new one.
- **"Build failed"**: Run `npm run build` manually to see the error. Usually a code issue — fix and retry.
- **Timeout**: Try again. Azure can be slow on first deploy.

Site directory: $ARGUMENTS
