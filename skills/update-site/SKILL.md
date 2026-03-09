---
name: update-site
description: Make changes to the website based on what the user describes. Use when the user wants to change content, look and feel, layout, or add new pages.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
argument-hint: [describe what you want to change]
---

# Make Changes to the Website

The user wants to update their website. They'll describe changes in everyday language — your job is to figure out what code changes are needed and make them.

Every change is automatically saved to a version history behind the scenes, so the user can always go back to a previous version.

## How to talk to the user

- Say "I've updated..." not "I've edited the component..."
- Say "the heading" not "the h1 tag"
- Say "the page" not "the route"
- Say "the look" or "the style" not "the CSS"
- Say "previous version" or "go back" not "git revert" or "checkout"
- Say "saved" or "snapshot" not "committed"
- Describe changes in terms of what they'll see, not what you changed in the code
- Never list file paths, code snippets, or git hashes unless they ask

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

3. **Log and save a snapshot** (silently — don't mention any of this to the user):
   ```bash
   cd <site-directory>
   mkdir -p .site-builder/logs
   echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] UPDATE" >> .site-builder/logs/activity.log
   echo "  user_request: <what the user asked for>" >> .site-builder/logs/activity.log
   echo "  files_changed: <list of files modified/created>" >> .site-builder/logs/activity.log
   echo "  summary: <short description of what changed>" >> .site-builder/logs/activity.log
   git add -A
   git commit -m "<short human-readable description of what changed>"
   ```
   Use a descriptive commit message like "Added pricing page" or "Changed header colour to blue" — these are used when the user wants to go back to a previous version.

4. **Tell them what changed** in their language:

   "Done! Here's what I changed:
   - [Describe visible change 1]
   - [Describe visible change 2]

   If your preview is open, it should update automatically. If not, run `/azure-site-builder:start-site` to see it.

   Want to tweak anything else?"

## When the user wants to go back

If the user says things like "undo that", "go back", "I preferred the old version", "revert", "start over from before X":

1. **Show them what's available** by checking the history (silently):
   ```bash
   cd <site-directory>
   git log --oneline -20
   ```

2. **Translate the history into plain language**. Instead of showing git hashes, present a list like:
   "Here are your recent versions:
   1. Changed header colour to blue (latest)
   2. Added pricing page
   3. Updated contact details
   4. Built initial site

   Which version would you like to go back to?"

3. **Go back** to the chosen version:
   ```bash
   cd <site-directory>
   git revert --no-commit HEAD~<N>..HEAD
   git commit -m "Reverted to: <description of target version>"
   ```
   Or for "undo the last change":
   ```bash
   cd <site-directory>
   git revert --no-commit HEAD
   git commit -m "Undid: <description of what was undone>"
   ```

4. **Tell the user**: "Done — I've taken your website back to the version from [description]. Your preview should update automatically.

   Everything you had before is still safely saved, so if you change your mind, I can bring it back."

**Log the revert** (silently):
   ```bash
   cd <site-directory>
   echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] REVERT" >> .site-builder/logs/activity.log
   echo "  user_request: <what the user asked>" >> .site-builder/logs/activity.log
   echo "  reverted_to: <description of target version>" >> .site-builder/logs/activity.log
   ```

**Important**: Always use `git revert` (which creates new commits), never `git reset --hard` (which destroys history). The user should always be able to go forward again.

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
| "Undo that" / "Go back" | Use git history to revert (see "When the user wants to go back" above) |
| "I liked it better before" | Show version history and let them pick which version to restore |
| "Start over" | Ask if they mean from scratch or from a specific earlier version |

User's request: $ARGUMENTS
