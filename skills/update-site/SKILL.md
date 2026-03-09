---
name: update-site
description: Update an existing website using plain-English instructions. Use when the user wants to change content, styling, layout, or add new pages to their site.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
argument-hint: [what you want to change]
---

# Update a Website

The user wants to make changes to an existing website using natural language.

1. **Find the site**:
   - Look for directories containing `index.html` in the current working directory
   - If multiple sites exist, ask which one to update
   - Read the existing files to understand the current state

2. **Understand the request**: Parse `$ARGUMENTS` for what they want. Common requests:
   - "Change the heading to..." → Edit HTML content
   - "Make it blue" → Update CSS colors
   - "Add a contact page" → Create new HTML file + update navigation
   - "Add my phone number" → Edit content in relevant section
   - "Make the text bigger" → Update CSS font sizes
   - "Add a photo gallery" → Create new section/page with image grid

3. **Make the changes**:
   - Use Edit tool for targeted changes (preferred)
   - Use Write tool only for new files
   - Keep changes minimal and focused on what was asked
   - Maintain consistency with existing style

4. **After updating**:
   - Summarize what changed in plain language
   - Suggest they preview with `/azure-site-builder:preview-site`
   - If they're happy, deploy with `/azure-site-builder:deploy-site`

User's request: $ARGUMENTS
