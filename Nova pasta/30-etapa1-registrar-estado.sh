#!/usr/bin/env bash
set -Eeuo pipefail

SOURCE_DIR="/opt/intent/source"
EXPECTED_MAIN="78cbdfd6cb7b3f67c72420f3ae44204dd320bd4c"

echo "================================================================"
echo "INTENT — ETAPA 1: REGISTRO DO ESTADO ATUAL"
echo "================================================================"
echo "Somente leitura. Nenhuma alteração será realizada."

[[ -d "${SOURCE_DIR}/.git" ]] || { echo "ERRO: ${SOURCE_DIR} não é um repositório Git."; exit 1; }

echo "[1/8] Repositório local"
LOCAL_SHA="$(git -C "${SOURCE_DIR}" rev-parse HEAD)"
BRANCH="$(git -C "${SOURCE_DIR}" branch --show-current || true)"
[[ -n "${BRANCH}" ]] || BRANCH="detached"
echo "Branch: ${BRANCH}"
echo "Commit local: ${LOCAL_SHA}"
if git -C "${SOURCE_DIR}" diff --quiet; then
  echo "Alterações locais: nenhuma"
else
  echo "ERRO: existem alterações locais."
fi

echo "[2/8] Referência remota da main"
REMOTE_SHA="$(sudo -H -u ubuntu git -C "${SOURCE_DIR}" ls-remote origin refs/heads/main | awk '{print $1}')"
echo "Commit remoto main: ${REMOTE_SHA}"
[[ "${REMOTE_SHA}" == "${EXPECTED_MAIN}" ]] && echo "Main remota: OK" || echo "ATENÇÃO: main remota diferente do commit esperado"

echo "[3/8] Containers"
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' \
  --filter name=intent-postgres --filter name=intent-redis \
  --filter name=intent-api --filter name=intent-frontend

echo "[4/8] Saúde dos containers"
for container in intent-postgres intent-redis intent-api intent-frontend; do
  if docker inspect -f '{{.State.Status}} {{if .State.Health}}{{.State.Health.Status}}{{end}}' "${container}" 2>/dev/null; then
    :
  else
    echo "AUSENTE: ${container}"
  fi
done

echo "[5/8] Saúde da API e frontend"
curl -fsS http://127.0.0.1:8080/health/ready || echo "API não respondeu"
echo
curl -fsS http://127.0.0.1:3000/healthz || echo "Frontend não respondeu"
echo

echo "[6/8] Portas locais"
ss -ltnp | grep -E '127\.0\.0\.1:(3000|8080)' || echo "Portas esperadas não encontradas"

echo "[7/8] Banco e Redis"
docker exec intent-postgres pg_isready 2>/dev/null || echo "PostgreSQL não respondeu"
docker exec intent-redis redis-cli ping 2>/dev/null || echo "Redis não respondeu"

echo "[8/8] Resultado"
echo "Commit esperado da main: ${EXPECTED_MAIN}"
echo "Commit local da VM:      ${LOCAL_SHA}"
echo "Commit remoto da main:   ${REMOTE_SHA}"
echo
echo "ETAPA 1 CONCLUÍDA: estado registrado."
echo "Nenhuma alteração foi realizada."
