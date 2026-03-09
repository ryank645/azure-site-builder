---
name: setup
description: Check everything is ready to start building. Run this first before creating a website.
allowed-tools: Bash, Read, Glob
---

# Getting You Set Up

You're helping a product owner or business user get ready to build and publish websites. They don't know (or need to know) what Node.js, npm, or CLI tools are. Speak their language:

- Say "your computer" not "your machine"
- Say "publish" not "deploy"
- Say "preview" not "run the dev server"
- Say "website builder tools" not "Node.js and npm"
- Never mention technical details unless something goes wrong and they need to act

Run each check below silently. Only surface issues that need the user's attention.

## Check 1: Website builder tools (Node.js + npm)

```bash
node --version
npm --version
```

**If installed**, say nothing — move on.

**If missing**, say:
"I need to install some website builder tools on your computer. This is a one-time setup."
- Try: `winget install OpenJS.NodeJS.LTS`
- If winget fails: "I need you to do one thing manually: go to https://nodejs.org, click the big green download button, and run the installer. Accept all the defaults. Once it's done, restart this chat and run `/azure-site-builder:setup` again."

## Check 2: Publishing credentials

```bash
echo "${SWA_DEPLOYMENT_TOKEN:-not set}"
```

**If set**, say nothing — move on.

**If not set**, say:
"You're almost ready! To publish websites, you'll need a publishing key from your admin. They'll give you a long code that looks like a random string of characters.

Once you have it, set it up in PowerShell (one-time):
```
[System.Environment]::SetEnvironmentVariable('SWA_DEPLOYMENT_TOKEN', 'paste-your-key-here', 'User')
```
Then restart this chat.

You can still design and preview websites without this — you just won't be able to publish them live until you set it up."

## Check 3: Publishing tools (SWA CLI)

```bash
npx @azure/static-web-apps-cli --version 2>&1
```

**If it works**, say nothing.
**If it fails**, try: `npm install -g @azure/static-web-apps-cli`
- If that also fails, revisit Check 1.

## Summary

Show a friendly status:

If everything passed:
"You're all set! Here's what you can do:

- **Create a website**: `/azure-site-builder:create-site` — tell me what you want and I'll build it
- **Preview it**: `/azure-site-builder:start-site` — see it in your browser before it goes live
- **Make changes**: just tell me what to change in plain English
- **Publish it**: `/azure-site-builder:deploy-site` — put it live on the internet"

If Node works but no token:
"You're ready to start designing! You can create and preview websites right now.

When you're ready to publish, ask your admin for a publishing key and I'll walk you through setting it up."

If Node is missing:
"We need to get one thing installed first — I've explained what to do above. Once that's sorted, run `/azure-site-builder:setup` again and we'll be good to go."
