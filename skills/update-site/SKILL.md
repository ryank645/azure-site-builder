---
name: update-site
description: Update an existing React website using plain-English instructions. Use when the user wants to change content, styling, layout, add pages, or modify any part of their site.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
argument-hint: [what you want to change]
---

# Update the Website

The user wants to make changes to their React site using natural language. They are non-technical.

1. **Find the site**:
   - Look for React projects (directories with `package.json` + `src/App.jsx`) in the current working directory
   - If multiple sites exist, ask which one to update
   - Read the existing components to understand the current state

2. **Understand the request** and map it to code changes. Common requests:
   - "Change the heading to..." → Edit JSX content
   - "Make it blue" → Update CSS colors/theme
   - "Add a contact page" → Create new page component + add route
   - "Add my phone number" → Edit content in relevant component
   - "Make the text bigger" → Update CSS font sizes
   - "Add a photo gallery" → Create new component with image grid
   - "Add a navigation menu" → Update Header/Nav component
   - "Make it look more modern" → Restyle with updated CSS

3. **Make the changes**:
   - Use Edit tool for targeted changes (preferred)
   - Use Write tool only for new files (new pages, new components)
   - Keep changes minimal and focused on what was asked
   - Maintain consistency with existing style and patterns
   - If the dev server is running, changes will hot-reload automatically

4. **After updating**, tell the user in plain language:
   - What changed
   - "Check your browser — it should update automatically"
   - "Want to change anything else? Just tell me"
   - "Happy with it? Run `/azure-site-builder:deploy-site` to publish"

User's request: $ARGUMENTS
