---
name: update-site
description: Make changes to the website based on what the user describes. Use when the user wants to change content, look and feel, layout, or add new pages.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
argument-hint: [describe what you want to change]
---

# Make Changes to the Website

The user wants to update their website. They'll describe changes in everyday language — your job is to figure out what code changes are needed and make them.

## How to talk to the user

- Say "I've updated..." not "I've edited the component..."
- Say "the heading" not "the h1 tag"
- Say "the page" not "the route"
- Say "the look" or "the style" not "the CSS"
- Describe changes in terms of what they'll see, not what you changed in the code
- Never list file paths or code snippets unless they ask

## Steps

1. **Find the site**:
   - Look for React projects in the current working directory
   - If multiple exist, ask which one
   - Read the relevant files to understand the current state

2. **Make the changes**:
   - Map their request to the right code changes
   - Use Edit for targeted changes (preferred over rewriting files)
   - Keep changes focused — only change what they asked for
   - Maintain visual consistency with the rest of the site

3. **Tell them what changed** in their language:

   "Done! Here's what I changed:
   - [Describe visible change 1]
   - [Describe visible change 2]

   If your preview is open, it should update automatically. If not, run `/azure-site-builder:start-site` to see it.

   Want to tweak anything else?"

## Common requests and what they mean

| What they say | What to do |
|---|---|
| "Make it more modern" | Update fonts, spacing, colours, add subtle shadows/rounded corners |
| "It feels cluttered" | Add whitespace, simplify layout, reduce content density |
| "Can you add a contact form?" | Add a form section (name, email, message) with basic styling |
| "Change the colours to match our brand" | Ask for brand colours or a reference, update colour scheme globally |
| "Add a new page for X" | Create new page component, add to navigation |
| "Move X above Y" | Reorder sections/components in the JSX |
| "Make it work on mobile" | Check responsive styles, fix any issues |
| "Add our logo" | Ask for the image file, add it to the header |

User's request: $ARGUMENTS
