---
name: start-site
description: Preview the website in the browser. Use when the user wants to see what their site looks like.
allowed-tools: Read, Bash, Glob
argument-hint: [site-directory]
---

# Preview the Website

The user wants to see their website. Keep it simple — they just want to look at it in their browser.

## How to talk to the user

- Say "preview" not "dev server"
- Say "your browser" not "localhost"
- Say "it updates automatically" not "hot module replacement"
- Don't mention ports, URLs with numbers, or terminal output unless necessary

## Steps

1. **Find the site**:
   - If `$ARGUMENTS` is provided, use that directory
   - Otherwise, look for directories with `package.json` and a `dev` script
   - If multiple exist, ask: "I found a few websites — which one do you want to preview?"  and list them by folder name

2. **Install dependencies if needed**:
   ```bash
   cd <site-directory>
   npm install
   ```

3. **Start the preview** in the background:
   ```bash
   cd <site-directory>
   npm run dev
   ```

4. **Tell the user**:
   "Your website is ready to preview! Open this link in your browser:

   **http://localhost:5173**

   As you ask me to make changes, the preview will update automatically — just keep the browser tab open.

   When you're happy with how it looks, say **'publish it'** to put it live on the internet."

Site directory: $ARGUMENTS
