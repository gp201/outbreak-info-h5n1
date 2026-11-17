#!/usr/bin/env bash
#
# Update h5n1_us_cases.json: Claude Code follows the steps in fetch_h5n1_cases.md.
# Requires: claude, curl, jq, Google Chrome. A run takes about 20-30 minutes.

set -euo pipefail
cd "$(dirname "$0")"

claude -p "Follow these instructions:

$(cat fetch_h5n1_cases.md)" \
  --model opus \
  --effort max \
  --permission-mode auto \
  --allowedTools WebSearch,WebFetch \
  --no-session-persistence
