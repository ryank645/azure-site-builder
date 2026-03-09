---
name: start-site
description: Start the React development server locally so the user can preview their website in the browser. Use when the user wants to see or test their site.
allowed-tools: Read, Bash, Glob
argument-hint: [site-directory]
---

# Start Local Dev Server

The user wants to preview their React site locally.

1. **Find the site directory**:
   - If `$ARGUMENTS` is provided, use that as the site directory
   - Otherwise, look for directories containing `package.json` with a `dev` script in the current working directory
   - If multiple candidates exist, ask the user which one

2. **Install dependencies if needed**:
   ```bash
   cd <site-directory>
   npm install
   ```

3. **Start the dev server** in the background:
   ```bash
   cd <site-directory>
   npm run dev
   ```
   Run this in the background so the user can keep chatting.

4. **Tell the user**:
   - "Your site is running at http://localhost:5173 (or whatever port Vite says)"
   - "Open that URL in your browser to see it"
   - "Tell me what you'd like to change — I'll update the code and your browser will refresh automatically"
   - "When you're happy with it, run `/azure-site-builder:deploy-site` to publish it live"

Site directory: $ARGUMENTS
