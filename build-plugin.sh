#!/usr/bin/env bash

# Build the azure-site-builder.plugin file for Cowork
#
# Usage: bash build-plugin.sh
#
# Output: azure-site-builder.plugin (in project root)

set -e

PLUGIN_NAME="azure-site-builder"
OUTPUT_FILE="${PLUGIN_NAME}.plugin"

echo "Building ${OUTPUT_FILE}..."

# Remove old build
rm -f "$OUTPUT_FILE"

# Create the .plugin file (zip with .plugin extension)
# Include only the files Cowork needs — exclude git, node_modules, etc.
zip -r "$OUTPUT_FILE" \
  .claude-plugin/ \
  skills/ \
  scripts/ \
  -x "*.git*" \
  -x "*node_modules*" \
  -x "*.DS_Store" \
  -x "*__pycache__*"

echo ""
echo "Built: ${OUTPUT_FILE} ($(du -h "$OUTPUT_FILE" | cut -f1))"
echo ""
echo "To install in Cowork:"
echo "  1. Open Claude Desktop → Cowork tab"
echo "  2. Click 'Customize' in the sidebar"
echo "  3. Click 'Browse plugins' → 'Upload'"
echo "  4. Select ${OUTPUT_FILE}"
echo ""
echo "To install org-wide:"
echo "  1. Claude Desktop → Organization Settings → Plugins"
echo "  2. Click 'Add plugins' → 'Upload a file'"
echo "  3. Select ${OUTPUT_FILE}"
