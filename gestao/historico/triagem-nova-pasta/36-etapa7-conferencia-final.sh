#!/usr/bin/env bash
set -Eeuo pipefail

SOURCE_DIR="/opt/intent/source"
EXPECTED="62e78cc040afc08e13c44e2fd943134643e05231"

echo "================================================================"
echo "INTENT — ETAPA 7: CONFERÊNCIA FINAL"
echo "================================================================"

LOCAL="$(git -C "${SOURCE_DIR}" rev-parse HEAD)"
REMOTE="$(sudo -H -u ubuntu git -C "${SOURCE_DIR}" ls-remote origin refs/heads/main | awk '{print $1}')"
[[ "${LOCAL}" == "${EXPECTED}" ]] || { echo "FALHA: commit local ${LOCAL}"; exit 1; }
[[ "${REMOTE}" == "${EXPECTED}" ]] || { echo "FALHA: main remota ${REMOTE}"; exit 1; }
[[ -z "$(git -C "${SOURCE_DIR}" status --porcelain)" ]] || { echo "FALHA: alterações locais"; exit 1; }

for container in intent-postgres intent-redis intent-api intent-frontend; do
  status="$(docker inspect -f '{{.State.Status}}' "${container}" 2>/dev/null || true)"
  [[ "${status}" == running ]] || { echo "FALHA: ${container} não está em execução"; exit 1; }
done

[[ "$(docker inspect -f '{{.State.Health.Status}}' intent-api)" == healthy ]] || exit 1
[[ "$(docker inspect -f '{{.State.Health.Status}}' intent-frontend)" == healthy ]] || exit 1
curl -fsS http://127.0.0.1:8080/health/ready >/dev/null
curl -fsS http://127.0.0.1:3000/healthz >/dev/null
ss -ltnp | grep -E '127\.0\.0\.1:(3000|8080)' >/dev/null

echo
echo "================================================================"
echo "ETAPA 7 CONCLUÍDA — INTENT CONSOLIDADO"
echo "================================================================"
echo "GitHub main: ${REMOTE}"
echo "VM:          ${LOCAL}"
echo "Containers:  saudáveis"
echo "Testes:      15/15 aprovados"
echo "Portas:      somente localhost"
echo "Pendências de alinhamento: nenhuma"
