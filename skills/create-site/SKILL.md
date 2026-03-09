---
name: create-site
description: Create a new website from a plain-English description. Use when the user wants to build a website, landing page, portfolio, or any static site without writing code.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
argument-hint: [description of the website you want]
---

# Create a Website

The user wants to create a website. They are non-technical, so:

1. **Ask clarifying questions** if the description is vague:
   - What is the site for? (business, portfolio, blog, event, etc.)
   - What pages do they need? (home, about, contact, etc.)
   - Any color/style preferences?
   - Do they have content (text, images) ready?

2. **Generate the site** in a new directory under the current working directory:
   - Create a folder named after the project (kebab-case)
   - Use clean, modern HTML5 + CSS3 + vanilla JavaScript
   - Make it responsive (mobile-friendly) by default
   - Use a CSS framework via CDN (e.g., Pico CSS or simple custom CSS) to keep it lightweight
   - Include a `staticwebapp.config.json` for Azure SWA routing if needed

3. **File structure**:
   ```
   site-name/
   ├── index.html
   ├── css/
   │   └── style.css
   ├── js/
   │   └── main.js
   ├── images/           (if needed)
   └── staticwebapp.config.json
   ```

4. **After creating the site**:
   - Summarize what was created in plain language
   - Tell them they can preview it with `/azure-site-builder:preview-site`
   - Tell them they can deploy it with `/azure-site-builder:deploy-site`
   - Explain how to make changes with `/azure-site-builder:update-site`

User's request: $ARGUMENTS
