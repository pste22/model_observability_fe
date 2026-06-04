#!/usr/bin/env bash
# Start the Next.js frontend on port 3000.
# Talks to the backend via the same-origin /api/evaluations proxy route.
set -euo pipefail

cd "$(dirname "$0")"

npm install

exec npm run dev -- -H 0.0.0.0
