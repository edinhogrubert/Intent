#!/usr/bin/env bash
set -Eeuo pipefail

SOURCE_DIR="/opt/intent/source"
WORK_DIR="$(mktemp -d /tmp/intent-validacao.XXXXXX)"
trap 'rm -rf "${WORK_DIR}"' EXIT

echo "================================================================"
echo "INTENT — ETAPA 4: VALIDAR A MAIN ALINHADA"
echo "================================================================"

EXPECTED="82f82264d17d430d2c162d129762011f909db97c"
ACTUAL="$(git -C "${SOURCE_DIR}" rev-parse HEAD)"
[[ "${ACTUAL}" == "${EXPECTED}" ]] || { echo "ERRO: commit incorreto."; exit 1; }
[[ -z "$(git -C "${SOURCE_DIR}" status --porcelain)" ]] || { echo "ERRO: alterações locais encontradas."; exit 1; }

echo "[1/6] Validando Compose..."
docker compose -f "${SOURCE_DIR}/backend/compose.yaml" config >/dev/null
docker compose -f "${SOURCE_DIR}/deploy/oracle/frontend.compose.yaml" config >/dev/null
echo "Compose: OK"

echo "[2/6] Instalando dependências frontend em ambiente descartável..."
docker run --rm -v "${SOURCE_DIR}:/app" -w /app oven/bun:1-alpine sh -c 'bun install --frozen-lockfile && bun run lint && bun run build' > "${WORK_DIR}/frontend.log"
echo "Frontend: lint e build OK"

echo "[3/6] Instalando dependências backend em ambiente descartável..."
docker run --rm -v "${SOURCE_DIR}/backend:/app" -w /app node:22-alpine sh -c 'npm ci --no-audit --no-fund && npm run prisma:generate && npm run lint && npm test && npm run build' > "${WORK_DIR}/backend.log"
echo "Backend: Prisma, lint, testes e build OK"

echo "[4/6] Conferindo migrações Prisma..."
find "${SOURCE_DIR}/backend/prisma/migrations" -maxdepth 1 -mindepth 1 -type d | sort
echo "Migrações: OK"

echo "[5/6] Confirmando ausência de segredos versionados..."
if git -C "${SOURCE_DIR}" ls-files | grep -E '(^|/)(\.env|.*\.pem|.*\.key|.*service.*\.json)$'; then
  echo "ERRO: possível segredo versionado encontrado."
  exit 1
fi
echo "Segredos versionados: nenhum encontrado"

echo "[6/6] Confirmando que a validação não alterou o Git..."
[[ -z "$(git -C "${SOURCE_DIR}" status --porcelain)" ]] || { echo "ERRO: validação alterou o repositório."; exit 1; }

echo
echo "================================================================"
echo "ETAPA 4 CONCLUÍDA"
echo "================================================================"
echo "Commit validado: ${ACTUAL}"
echo "Frontend, backend, migrações e Docker aprovados."

