#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
while IFS= read -r -d '' file; do
  if [[ "$file" == "$ROOT/backend/docker-entrypoint.sh" ]]; then sh -n "$file"; else bash -n "$file"; fi
done < <(find "$ROOT" -type d \( -name node_modules -o -name .git \) -prune -o -type f -name '*.sh' -print0)
python3 "$ROOT/script/testes/contratos.py"
