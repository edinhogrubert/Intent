#!/usr/bin/env bash
set -Eeuo pipefail

SOURCE_DIR="/opt/intent/source"
EXPECTED="62e78cc040afc08e13c44e2fd943134643e05231"
STAMP="$(date +%Y%m%d-%H%M%S)"

echo "================================================================"
echo "INTENT — ETAPA 5: REIMPLANTAR A MAIN CONSOLIDADA"
echo "================================================================"

ACTUAL="$(git -C "${SOURCE_DIR}" rev-parse HEAD)"
[[ "${ACTUAL}" == "${EXPECTED}" ]] || { echo "ERRO: commit ${ACTUAL}; esperado ${EXPECTED}."; exit 1; }
[[ -z "$(git -C "${SOURCE_DIR}" status --porcelain)" ]] || { echo "ERRO: alterações locais encontradas."; exit 1; }

echo "[1/7] Preservando imagens atuais para rollback..."
docker image tag intent-api-api:latest "intent-api-api:rollback-${STAMP}" 2>/dev/null || true
docker image tag intent-frontend:local "intent-frontend:rollback-${STAMP}" 2>/dev/null || true

echo "[2/7] Construindo backend..."
docker compose -f "${SOURCE_DIR}/backend/compose.yaml" build api

echo "[3/7] Construindo frontend..."
docker compose -f "${SOURCE_DIR}/deploy/oracle/frontend.compose.yaml" build frontend

echo "[4/7] Aplicando migrações e iniciando backend..."
docker compose -f "${SOURCE_DIR}/backend/compose.yaml" up -d api

echo "[5/7] Iniciando frontend..."
docker compose -f "${SOURCE_DIR}/deploy/oracle/frontend.compose.yaml" up -d frontend

echo "[6/7] Aguardando serviços saudáveis..."
for i in $(seq 1 30); do
  api_status="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' intent-api 2>/dev/null || true)"
  front_status="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' intent-frontend 2>/dev/null || true)"
  [[ "${api_status}" == healthy && "${front_status}" == healthy ]] && break
  sleep 5
done
[[ "$(docker inspect -f '{{.State.Health.Status}}' intent-api)" == healthy ]] || { echo "ERRO: API não ficou saudável."; docker logs --tail 80 intent-api; exit 1; }
[[ "$(docker inspect -f '{{.State.Health.Status}}' intent-frontend)" == healthy ]] || { echo "ERRO: frontend não ficou saudável."; docker logs --tail 80 intent-frontend; exit 1; }

echo "[7/7] Testes de fumaça e isolamento..."
curl -fsS http://127.0.0.1:8080/health/ready
echo
curl -fsS http://127.0.0.1:3000/healthz
echo
ss -ltnp | grep -E '127\.0\.0\.1:(3000|8080)'

echo
echo "================================================================"
echo "ETAPA 5 CONCLUÍDA"
echo "================================================================"
echo "Commit implantado: ${ACTUAL}"
echo "Rollback API:      intent-api-api:rollback-${STAMP}"
echo "Rollback frontend:  intent-frontend:rollback-${STAMP}"
echo "Portas públicas:    nenhuma"
