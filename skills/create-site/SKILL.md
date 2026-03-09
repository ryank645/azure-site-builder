---
name: create-site
description: Create a new React website project from a plain-English description. Use when the user wants to build a new website, landing page, portfolio, or any static site.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
argument-hint: [description of the website you want]
---

# Create a React Website

The user wants to create a website. They are non-technical, so guide them through it simply.

1. **Ask clarifying questions** if the description is vague:
   - What is the site for? (business, portfolio, blog, event, etc.)
   - What pages do they need? (home, about, contact, etc.)
   - Any color/style preferences?
   - Do they have content (text, images) ready?

2. **Create the React project** using Vite (fast, modern):
   ```bash
   npm create vite@latest <site-name> -- --template react
   cd <site-name>
   npm install
   ```

3. **Install useful dependencies**:
   ```bash
   npm install react-router-dom
   ```

4. **Build out the site** based on their description:
   - Create pages as React components in `src/pages/`
   - Set up routing with react-router-dom in `src/App.jsx`
   - Create reusable components in `src/components/` (Header, Footer, etc.)
   - Write clean CSS in component-level `.css` files or a shared `src/styles/`
   - Make it responsive (mobile-friendly) by default
   - Use modern, clean design — no unnecessary complexity

5. **Add Azure Static Web Apps config** at the project root:
   Create `staticwebapp.config.json`:
   ```json
   {
     "navigationFallback": {
       "rewrite": "/index.html",
       "exclude": ["/images/*.{png,jpg,gif}", "/css/*"]
     }
   }
   ```

6. **After creating the site**, tell the user in plain language:
   - What was created and what each part does
   - "Run `/azure-site-builder:start-site` to see it in your browser"
   - "Tell me what you'd like to change and I'll update it"
   - "When you're happy, run `/azure-site-builder:deploy-site` to publish it live"

User's request: $ARGUMENTS
