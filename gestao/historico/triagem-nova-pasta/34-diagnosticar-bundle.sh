#!/usr/bin/env bash
set -Eeuo pipefail

SOURCE_DIR="/opt/intent/source"
EXPECTED="82f82264d17d430d2c162d129762011f909db97c"
ACTUAL="$(git -C "${SOURCE_DIR}" rev-parse HEAD)"
[[ "${ACTUAL}" == "${EXPECTED}" ]] || { echo "ERRO: commit ${ACTUAL}; esperado ${EXPECTED}."; exit 1; }

echo "================================================================"
echo "INTENT — DIAGNÓSTICO DO BUNDLE FRONTEND"
echo "================================================================"
docker run --rm -v "${SOURCE_DIR}:/app" -w /app oven/bun:1-alpine sh -c \
  'bun install --frozen-lockfile >/dev/null && bun run build'

echo
echo "=== CHUNKS GERADOS ==="
find "${SOURCE_DIR}/dist/assets" -maxdepth 1 -type f -printf '%s %p\n' \
  | sort -nr \
  | awk '{printf "%.1f kB  %s\n", $1/1024, $2}'

echo
echo "Maior chunk (bytes):"
find "${SOURCE_DIR}/dist/assets" -maxdepth 1 -type f -printf '%s\n' | sort -nr | head -n1
