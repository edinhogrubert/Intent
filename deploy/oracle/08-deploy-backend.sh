#!/usr/bin/env bash

set -Eeuo pipefail

# ================================================================
# INTENT — IMPLANTAÇÃO INTERNA DO BACKEND
# A API fica disponível somente em 127.0.0.1:8080.
# Este script não altera UFW, NSG, portas 80/443 ou a branch Git.
# ================================================================

APP_USER="ubuntu"
BASE_DIR="/opt/intent"
SOURCE_DIR="${BASE_DIR}/source"
DATA_ENV="${BASE_DIR}/.env"
RUNTIME_DIR="${BASE_DIR}/runtime"
BACKUP_SCRIPT="${BASE_DIR}/scripts/executar-backup-postgres.sh"

BACKEND_DIR="${SOURCE_DIR}/backend"
COMPOSE_FILE="${BACKEND_DIR}/compose.yaml"
RUNTIME_ENV="${RUNTIME_DIR}/backend.env"

FIREBASE_PROJECT_ID="powerful-turbine-gq6d2"
CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
API_CONTAINER="intent-api"

trap 'echo; echo "ERRO NA LINHA ${LINENO}. Verifique os logs antes de repetir."; exit 1' ERR

if [[ "${EUID}" -ne 0 ]]; then
    echo "Execute usando sudo."
    exit 1
fi

echo "================================================================"
echo "INTENT — IMPLANTAÇÃO INTERNA DO BACKEND"
echo "================================================================"

echo "[1/8] Validando arquivos..."

for required in "${DATA_ENV}" "${COMPOSE_FILE}" "${BACKEND_DIR}/Dockerfile"; do
    if [[ ! -f "${required}" ]]; then
        echo "Arquivo obrigatório ausente: ${required}"
        exit 1
    fi
done

if [[ ! -d "${SOURCE_DIR}/.git" ]]; then
    echo "Repositório Git não encontrado em ${SOURCE_DIR}."
    exit 1
fi

if [[ -n "$(sudo -u "${APP_USER}" git -C "${SOURCE_DIR}" status --porcelain)" ]]; then
    echo "O repositório possui alterações locais. Nada será implantado."
    exit 1
fi

echo "[2/8] Validando PostgreSQL e rede privada..."

if [[ "$(docker inspect --format='{{.State.Health.Status}}' intent-postgres 2>/dev/null || true)" != "healthy" ]]; then
    echo "PostgreSQL não está saudável."
    exit 1
fi

if ! docker network inspect intent-private >/dev/null 2>&1; then
    echo "Rede Docker intent-private não encontrada."
    exit 1
fi

echo "[3/8] Criando configuração protegida..."

set -a
source "${DATA_ENV}"
set +a

: "${POSTGRES_DB:?POSTGRES_DB ausente em ${DATA_ENV}}"
: "${POSTGRES_USER:?POSTGRES_USER ausente em ${DATA_ENV}}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD ausente em ${DATA_ENV}}"

install -d -m 0750 -o root -g docker "${RUNTIME_DIR}"

EXISTING_REVEAL_KEY=""
if [[ -f "${RUNTIME_ENV}" ]]; then
    EXISTING_REVEAL_KEY="$(sed -n 's/^REVEAL_ENCRYPTION_KEY=//p' "${RUNTIME_ENV}" | head -n 1)"
fi

if [[ -n "${EXISTING_REVEAL_KEY}" ]]; then
    REVEAL_ENCRYPTION_KEY="${EXISTING_REVEAL_KEY}"
else
    REVEAL_ENCRYPTION_KEY="$(openssl rand -base64 32 | tr -d '\n')"
fi

umask 0077
{
    printf 'NODE_ENV=production\n'
    printf 'PORT=8080\n'
    printf 'LOG_LEVEL=info\n'
    printf 'CORS_ORIGINS=%s\n' "${CORS_ORIGINS}"
    printf 'DATABASE_URL=postgresql://%s:%s@intent-postgres:5432/%s?schema=public\n' \
        "${POSTGRES_USER}" "${POSTGRES_PASSWORD}" "${POSTGRES_DB}"
    printf 'FIREBASE_PROJECT_ID=%s\n' "${FIREBASE_PROJECT_ID}"
    printf 'REVEAL_ENCRYPTION_KEY=%s\n' "${REVEAL_ENCRYPTION_KEY}"
} > "${RUNTIME_ENV}"

chown root:docker "${RUNTIME_ENV}"
chmod 0640 "${RUNTIME_ENV}"

echo "Credenciais gravadas sem exibição na tela."

echo "[4/8] Criando backup anterior à migração..."

if [[ -x "${BACKUP_SCRIPT}" ]]; then
    "${BACKUP_SCRIPT}"
else
    echo "Rotina de backup não encontrada; implantação interrompida."
    exit 1
fi

echo "[5/8] Construindo a imagem ARM64..."

docker compose -f "${COMPOSE_FILE}" build --pull

echo "[6/8] Iniciando API e aplicando migrações..."

docker compose -f "${COMPOSE_FILE}" up -d

echo "[7/8] Aguardando saúde da API..."

API_STATUS="starting"
for attempt in {1..24}; do
    API_STATUS="$(docker inspect \
        --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' \
        "${API_CONTAINER}" 2>/dev/null || true)"

    if [[ "${API_STATUS}" == "healthy" ]]; then
        break
    fi

    if [[ "${API_STATUS}" == "exited" || "${API_STATUS}" == "unhealthy" ]]; then
        break
    fi

    sleep 5
done

if [[ "${API_STATUS}" != "healthy" ]]; then
    echo "API não ficou saudável. Estado: ${API_STATUS}"
    docker logs --tail 120 "${API_CONTAINER}" || true
    exit 1
fi

echo "[8/8] Executando testes de fumaça..."

curl --fail --silent --show-error http://127.0.0.1:8080/health
echo
curl --fail --silent --show-error http://127.0.0.1:8080/health/ready
echo

LISTEN_ADDRESS="$(ss -lntp | grep ':8080 ' || true)"
echo "${LISTEN_ADDRESS}"

if grep -Eq '(^|[[:space:]])(0\.0\.0\.0|\*):8080' <<< "${LISTEN_ADDRESS}"; then
    echo "ERRO: a API está exposta em todas as interfaces."
    exit 1
fi

echo
echo "================================================================"
echo "BACKEND IMPLANTADO INTERNAMENTE"
echo "================================================================"
echo "Contêiner:       ${API_CONTAINER}"
echo "Endereço local:  http://127.0.0.1:8080"
echo "PostgreSQL:      conectado"
echo "Migrações:       aplicadas"
echo "Acesso externo:  bloqueado"
echo "Portas 80/443:   inalteradas"
echo "================================================================"
