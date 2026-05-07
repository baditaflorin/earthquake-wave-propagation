#!/usr/bin/env bash
set -euo pipefail

npm run build

PORT="${PORT:-4173}"
BASE_URL="http://127.0.0.1:${PORT}/earthquake-wave-propagation/"

npx vite preview --host 127.0.0.1 --port "${PORT}" >/tmp/earthquake-wave-propagation-smoke.log 2>&1 &
SERVER_PID=$!
trap 'kill "${SERVER_PID}" >/dev/null 2>&1 || true' EXIT

node scripts/wait-for-url.mjs "${BASE_URL}"
node scripts/smoke-playwright.mjs "${BASE_URL}"
