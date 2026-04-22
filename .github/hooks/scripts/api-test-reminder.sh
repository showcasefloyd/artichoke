#!/usr/bin/env bash
# api-test-reminder.sh
#
# PostToolUse hook: after any file-editing tool, check whether app/api.php or
# app/index.js was modified. If so, inject a system message reminding the agent
# to update tests/Api/ApiTest.php and run the PHP test suite.
#
# Input (stdin): JSON blob provided by the agent runtime with at least:
#   { "toolName": "...", "toolInput": { "filePath": "..." }, ... }

set -euo pipefail

input=$(cat)

# Only fire for file-editing tools
echo "$input" | grep -qE '"toolName"\s*:\s*"(replace_string_in_file|multi_replace_string_in_file|create_file)"' || exit 0

# Only fire when app/api.php or app/index.js is among the touched files
echo "$input" | grep -qE '/app/(api\.php|index\.js)"' || exit 0

cat <<'EOF'
{
  "systemMessage": "You just modified app/api.php or app/index.js. Before finishing this task: (1) check whether tests/Api/ApiTest.php needs a new or updated test for the changed function or route; (2) run `npm run test:php` inside the Docker stack to confirm the full PHP suite still passes."
}
EOF
