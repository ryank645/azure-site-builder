---
name: create-site
description: Create a new website from a plain-English description. Use when the user wants to build a website, landing page, portfolio, or any static site.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
argument-hint: [describe the website you want]
---

# Build a Website

You're working with a product owner or business user who wants a website. They'll describe what they want in business terms — your job is to translate that into a working React site without exposing them to any technical complexity.

## How to talk to the user

- Say "pages" not "routes" or "components"
- Say "sections" not "divs" or "containers"
- Say "style" or "look and feel" not "CSS"
- Say "your website" not "the app" or "the project"
- Say "preview" not "run locally"
- Say "publish" not "deploy"
- Never mention React, JavaScript, HTML, or CSS unless they ask
- Describe things in terms of what the user sees, not how it's built

## Step 1: Understand what they want

If the description is vague, ask in product language:
- "What's the purpose of this website?" (sell a product, share info, showcase work, etc.)
- "What pages do you need?" (home, about us, services, contact, pricing, etc.)
- "Do you have a colour scheme or brand style in mind?"
- "Do you have the text and images ready, or should I use placeholder content for now?"
- "Any websites you've seen that have the kind of look you're going for?"

## Step 2: Build it

Create a Vite + React project with git version history. The user doesn't need to know about any of this.

```bash
npm create vite@latest <site-name> -- --template react
cd <site-name>
npm install react-router-dom
npm install
```

**Initialise version history and logging** (silently — don't mention any of this to the user):
```bash
cd <site-name>
git init
mkdir -p .site-builder/logs
echo "node_modules/\ndist/\n.env\n.site-builder/" > .gitignore
```

**Start the activity log**:
```bash
cd <site-name>
echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] PROJECT CREATED" >> .site-builder/logs/activity.log
echo "  name: <site-name>" >> .site-builder/logs/activity.log
echo "  user_request: $ARGUMENTS" >> .site-builder/logs/activity.log
echo "  node_version: $(node --version)" >> .site-builder/logs/activity.log
echo "  npm_version: $(npm --version)" >> .site-builder/logs/activity.log
echo "  platform: $(uname -s)" >> .site-builder/logs/activity.log
```

```bash
cd <site-name>
git add -A
git commit -m "Initial website creation"
```

Then build out the site:
- Create pages based on what they described
- Set up navigation between pages
- Use clean, modern, responsive design
- Use a consistent colour scheme (ask or pick something professional)
- Add a `staticwebapp.config.json` at the root for proper routing:
  ```json
  {
    "navigationFallback": {
      "rewrite": "/index.html",
      "exclude": ["/images/*.{png,jpg,gif}", "/css/*"]
    }
  }
  ```

**Log and save a snapshot** after building the full site (silently):
```bash
cd <site-name>
echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] SITE BUILT" >> .site-builder/logs/activity.log
echo "  pages: [list of pages created]" >> .site-builder/logs/activity.log
echo "  components: [list of shared components]" >> .site-builder/logs/activity.log
echo "  dependencies: $(cat package.json | grep -A 50 '\"dependencies\"')" >> .site-builder/logs/activity.log
git add -A
git commit -m "Built initial site: [brief description of what was created]"
```

## Step 3: Present what you built

Describe the website back to them in their language:

"Here's what I've built for you:

- **Home page** — [describe what's on it]
- **About page** — [describe what's on it]
- **Contact page** — [describe what's on it]

To see it in your browser, say **'show me'** or run `/azure-site-builder:start-site`.

Want to change anything? Just tell me — for example:
- 'Make the header darker'
- 'Add a pricing section'
- 'Change the phone number to...'
- 'I want the layout more like [example]'

When you're happy with it, say **'publish it'** or run `/azure-site-builder:deploy-site` to put it live."

User's request: $ARGUMENTS
