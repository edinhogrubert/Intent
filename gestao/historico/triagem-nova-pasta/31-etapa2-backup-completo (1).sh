#!/usr/bin/env bash
set -Eeuo pipefail

SOURCE_DIR="/opt/intent/source"
BACKUP_ROOT="/opt/intent/backups/alinhamento-$(date +%Y-%m-%d_%H-%M-%S)"
CODE_BACKUP="${BACKUP_ROOT}/source"
IMAGE_BACKUP="${BACKUP_ROOT}/images"
CONFIG_BACKUP="${BACKUP_ROOT}/config"

echo "================================================================"
echo "INTENT — ETAPA 2: BACKUP COMPLETO ANTES DO ALINHAMENTO"
echo "================================================================"
echo "Nenhum container será parado e nenhum código ativo será alterado."

[[ -d "${SOURCE_DIR}/.git" ]] || { echo "ERRO: repositório não encontrado."; exit 1; }
mkdir -p "${CODE_BACKUP}" "${IMAGE_BACKUP}" "${CONFIG_BACKUP}"

echo "[1/6] Registrando estado dos containers e imagens..."
docker ps --format '{{.Names}}|{{.Image}}|{{.Status}}|{{.Ports}}' > "${BACKUP_ROOT}/containers.txt"
for image in intent-api-api:latest intent-frontend:local postgres:16-alpine redis:7-alpine; do
  docker image inspect "${image}" > "${IMAGE_BACKUP}/$(echo "${image}" | tr '/:' '__').json" 2>/dev/null || true
done

echo "[2/6] Salvando imagens Docker atuais..."
docker save intent-api-api:latest intent-frontend:local postgres:16-alpine redis:7-alpine 2>/dev/null \
  | gzip -1 > "${IMAGE_BACKUP}/intent-imagens-atuais.tar.gz"

echo "[3/6] Copiando o código atual sem artefatos gerados..."
tar -czf "${CODE_BACKUP}/source-atual.tar.gz" \
  --exclude="${SOURCE_DIR}/node_modules" \
  --exclude="${SOURCE_DIR}/backend/node_modules" \
  --exclude="${SOURCE_DIR}/dist" \
  --exclude="${SOURCE_DIR}/runtime" \
  --exclude="${SOURCE_DIR}/backups" \
  "${SOURCE_DIR}"

echo "[4/6] Salvando configurações protegidas..."
if [[ -d /opt/intent/runtime ]]; then
  tar -czf "${CONFIG_BACKUP}/runtime-protegido.tar.gz" -C /opt/intent runtime
fi
if [[ -f /opt/intent/backend/compose.yaml ]]; then
  cp -p /opt/intent/backend/compose.yaml "${CONFIG_BACKUP}/backend-compose.yaml"
fi
if [[ -f /opt/intent/deploy/oracle/frontend.compose.yaml ]]; then
  cp -p /opt/intent/deploy/oracle/frontend.compose.yaml "${CONFIG_BACKUP}/frontend-compose.yaml"
fi

echo "[5/6] Criando backup PostgreSQL..."
if [[ -x /opt/intent/scripts/executar-backup-postgres.sh ]]; then
  /opt/intent/scripts/executar-backup-postgres.sh
else
  echo "ERRO: script oficial de backup PostgreSQL não encontrado."
  exit 1
fi
LATEST_DB="$(find /opt/intent/backups/postgres -maxdepth 1 -type f -name '*.dump' -printf '%T@ %p\n' | sort -nr | head -n1 | cut -d' ' -f2-)"
[[ -n "${LATEST_DB}" && -s "${LATEST_DB}" ]] || { echo "ERRO: backup PostgreSQL não localizado."; exit 1; }
cp -p "${LATEST_DB}" "${BACKUP_ROOT}/$(basename "${LATEST_DB}")"

echo "[6/6] Gerando manifesto e checksum..."
{
  echo "Data: $(date --iso-8601=seconds)"
  echo "Commit local: $(git -C "${SOURCE_DIR}" rev-parse HEAD)"
  echo "Branch: $(git -C "${SOURCE_DIR}" branch --show-current || true)"
  echo "Backup PostgreSQL: ${LATEST_DB}"
  echo "Diretório: ${BACKUP_ROOT}"
} > "${BACKUP_ROOT}/MANIFESTO.txt"
find "${BACKUP_ROOT}" -type f -print0 | sort -z | xargs -0 sha256sum > "${BACKUP_ROOT}/SHA256SUMS"
chmod 0600 "${BACKUP_ROOT}/SHA256SUMS" "${BACKUP_ROOT}/MANIFESTO.txt"

echo
echo "================================================================"
echo "ETAPA 2 CONCLUÍDA"
echo "================================================================"
echo "Backup: ${BACKUP_ROOT}"
echo "Código, banco, configurações e imagens Docker preservados."
echo "Containers permaneceram em execução."
