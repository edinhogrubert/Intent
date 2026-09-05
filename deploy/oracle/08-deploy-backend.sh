#!/usr/bin/env bash

set -Eeuo pipefail

# ================================================================
# INTENT — IMPLANTAÇÃO INTERNA SEGURA DO BACKEND
# A API fica disponível somente em 127.0.0.1:8080.
# O build ocorre com a versão anterior ativa. A janela de manutenção
# começa antes do backup e termina somente após os testes de saúde.
# ================================================================

APP_USER="ubuntu"
BASE_DIR="/opt/intent"
SOURCE_DIR="${BASE_DIR}/source"
DATA_ENV="${BASE_DIR}/.env"
RUNTIME_DIR="${BASE_DIR}/runtime"
BACKUP_SCRIPT="${BASE_DIR}/scripts/executar-backup-postgres.sh"
BACKUP_DIR="${BASE_DIR}/backups/postgres"

BACKEND_DIR="${SOURCE_DIR}/backend"
COMPOSE_FILE="${BACKEND_DIR}/compose.yaml"
RUNTIME_ENV="${RUNTIME_DIR}/backend.env"
FIREBASE_CREDENTIALS_FILE="${BASE_DIR}/secrets/firebase-admin.json"

FIREBASE_PROJECT_ID="intent-86155"
CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000,http://localhost:3100,http://127.0.0.1:3100"
API_CONTAINER="intent-api"
COMPOSE_IMAGE="intent-api-api:latest"

ROLLBACK_IMAGE_TAG=""
PRE_DEPLOY_BACKUP=""
DEPLOYMENT_STARTED=0
DATABASE_MAY_HAVE_CHANGED=0

rollback_on_error() {
    local exit_code="$1"
    local failed_line="$2"
    local restore_ok=1
    local rollback_status=""

    trap - ERR
    echo
    echo "ERRO NA LINHA ${failed_line}. Iniciando recuperação segura."

    if [[ "${DEPLOYMENT_STARTED}" -ne 1 ]]; then
        echo "A janela de manutenção ainda não havia começado; a API anterior permanece ativa."
        exit "${exit_code}"
    fi

    docker stop "${API_CONTAINER}" >/dev/null 2>&1 || true

    if [[ "${DATABASE_MAY_HAVE_CHANGED}" -eq 1 ]]; then
        if [[ -z "${PRE_DEPLOY_BACKUP}" || ! -s "${PRE_DEPLOY_BACKUP}" ]]; then
            echo "FALHA CRÍTICA: backup anterior não localizado. A API permanecerá parada."
            restore_ok=0
        else
            echo "Restaurando o PostgreSQL em transação única..."
            if docker exec -i intent-postgres pg_restore \
                --clean --if-exists --single-transaction --no-owner --no-privileges \
                --username "${POSTGRES_USER}" --dbname "${POSTGRES_DB}" \
                < "${PRE_DEPLOY_BACKUP}"; then
                echo "Banco anterior restaurado e validado pelo pg_restore."
            else
                echo "FALHA CRÍTICA: o banco não foi restaurado. A API permanecerá parada."
                restore_ok=0
            fi
        fi
    else
        echo "Nenhuma migração foi iniciada; o banco não precisa ser restaurado."
    fi

    if [[ "${restore_ok}" -ne 1 ]]; then
        echo "Não reinicie a aplicação antes de recuperar e validar o PostgreSQL."
        exit "${exit_code}"
    fi

    if [[ -z "${ROLLBACK_IMAGE_TAG}" ]] \
        || ! docker image inspect "${ROLLBACK_IMAGE_TAG}" >/dev/null 2>&1; then
        echo "FALHA CRÍTICA: imagem anterior indisponível. A API permanecerá parada."
        exit "${exit_code}"
    fi

    echo "Restaurando a imagem anterior..."
    docker tag "${ROLLBACK_IMAGE_TAG}" "${COMPOSE_IMAGE}"
    if ! docker compose -f "${COMPOSE_FILE}" up -d --no-build --force-recreate; then
        echo "FALHA CRÍTICA: não foi possível reiniciar a imagem anterior."
        exit "${exit_code}"
    fi

    for _attempt in {1..24}; do
        rollback_status="$(docker inspect \
            --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' \
            "${API_CONTAINER}" 2>/dev/null || true)"
        [[ "${rollback_status}" == "healthy" ]] && break
        sleep 5
    done

    if [[ "${rollback_status}" == "healthy" ]]; then
        echo "Rollback concluído; banco e API anteriores voltaram a ficar saudáveis."
    else
        echo "FALHA CRÍTICA: a API anterior não ficou saudável. Estado: ${rollback_status:-indisponível}."
        docker logs --tail 120 "${API_CONTAINER}" || true
    fi

    exit "${exit_code}"
}

trap 'rollback_on_error "$?" "${LINENO}"' ERR

if [[ "${EUID}" -ne 0 ]]; then
    echo "Execute usando sudo."
    exit 1
fi

echo "================================================================"
echo "INTENT — IMPLANTAÇÃO INTERNA SEGURA DO BACKEND"
echo "================================================================"

echo "[1/8] Validando ambiente..."

for command in docker curl openssl python3 ss stat; do
    if ! command -v "${command}" >/dev/null 2>&1; then
        echo "Comando obrigatório ausente: ${command}"
        exit 1
    fi
done

for required in "${DATA_ENV}" "${COMPOSE_FILE}" "${BACKEND_DIR}/Dockerfile"; do
    if [[ ! -f "${required}" ]]; then
        echo "Arquivo obrigatório ausente: ${required}"
        exit 1
    fi
done

if [[ ! -f "${FIREBASE_CREDENTIALS_FILE}" || -L "${FIREBASE_CREDENTIALS_FILE}" ]]; then
    echo "Credencial Firebase ausente ou inválida: ${FIREBASE_CREDENTIALS_FILE}"
    exit 1
fi

CREDENTIAL_OWNER="$(stat -c '%u:%g' "${FIREBASE_CREDENTIALS_FILE}")"
CREDENTIAL_MODE="$(stat -c '%a' "${FIREBASE_CREDENTIALS_FILE}")"
if [[ "${CREDENTIAL_OWNER}" != "0:10001" || "${CREDENTIAL_MODE}" != "440" ]]; then
    echo "Permissões inseguras na credencial Firebase."
    echo "Esperado: proprietário root, grupo 10001 e modo 440."
    exit 1
fi

python3 - "${FIREBASE_CREDENTIALS_FILE}" "${FIREBASE_PROJECT_ID}" <<'PY'
import json
import sys

path, expected_project = sys.argv[1], sys.argv[2]
with open(path, encoding='utf-8') as credential_file:
    credential = json.load(credential_file)

if credential.get('type') != 'service_account':
    raise SystemExit('A credencial não é uma conta de serviço.')
if credential.get('project_id') != expected_project:
    raise SystemExit('A credencial pertence a outro projeto Firebase.')
if not credential.get('client_email') or not credential.get('private_key'):
    raise SystemExit('A credencial Firebase está incompleta.')
PY

echo "Credencial administrativa validada sem exibir conteúdo."

if [[ ! -d "${SOURCE_DIR}/.git" ]]; then
    echo "Repositório Git não encontrado em ${SOURCE_DIR}."
    exit 1
fi

if [[ -n "$(sudo -u "${APP_USER}" git -C "${SOURCE_DIR}" status --porcelain)" ]]; then
    echo "O repositório possui alterações locais. Nada será implantado."
    exit 1
fi

echo "[2/8] Validando serviços de dados..."

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

urlencode() {
    python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1], safe=""))' "$1"
}

ENCODED_POSTGRES_USER="$(urlencode "${POSTGRES_USER}")"
ENCODED_POSTGRES_PASSWORD="$(urlencode "${POSTGRES_PASSWORD}")"
ENCODED_POSTGRES_DB="$(urlencode "${POSTGRES_DB}")"

umask 0077
{
    printf 'NODE_ENV=production\n'
    printf 'PORT=8080\n'
    printf 'LOG_LEVEL=info\n'
    printf 'CORS_ORIGINS=%s\n' "${CORS_ORIGINS}"
    printf 'DATABASE_URL=postgresql://%s:%s@intent-postgres:5432/%s?schema=public\n' \
        "${ENCODED_POSTGRES_USER}" "${ENCODED_POSTGRES_PASSWORD}" "${ENCODED_POSTGRES_DB}"
    printf 'FIREBASE_PROJECT_ID=%s\n' "${FIREBASE_PROJECT_ID}"
    printf 'GOOGLE_APPLICATION_CREDENTIALS=/run/secrets/firebase-admin.json\n'
    printf 'REVEAL_ENCRYPTION_KEY=%s\n' "${REVEAL_ENCRYPTION_KEY}"
} > "${RUNTIME_ENV}"

chown root:docker "${RUNTIME_ENV}"
chmod 0640 "${RUNTIME_ENV}"
echo "Configuração gravada sem exibir credenciais."

echo "[4/8] Preservando a versão atual e construindo a nova imagem..."

CURRENT_IMAGE_ID="$(docker inspect --format='{{.Image}}' "${API_CONTAINER}" 2>/dev/null || true)"
if [[ -n "${CURRENT_IMAGE_ID}" ]]; then
    ROLLBACK_IMAGE_TAG="intent-api-api:rollback-$(date +%Y%m%d-%H%M%S)"
    docker tag "${CURRENT_IMAGE_ID}" "${ROLLBACK_IMAGE_TAG}"
    echo "Imagem anterior preservada em ${ROLLBACK_IMAGE_TAG}."
else
    echo "Não existe API anterior; esta será a primeira implantação."
fi

docker compose -f "${COMPOSE_FILE}" build --pull

echo "[5/8] Abrindo janela de manutenção e criando backup consistente..."

DEPLOYMENT_STARTED=1
if [[ -n "${CURRENT_IMAGE_ID}" ]]; then
    docker stop "${API_CONTAINER}" >/dev/null
fi

if [[ -x "${BACKUP_SCRIPT}" ]]; then
    "${BACKUP_SCRIPT}"
else
    echo "Rotina de backup não encontrada; implantação interrompida."
    exit 1
fi

PRE_DEPLOY_BACKUP="$(ls -1t "${BACKUP_DIR}"/intent_*.dump 2>/dev/null | head -n 1 || true)"
if [[ -z "${PRE_DEPLOY_BACKUP}" || ! -s "${PRE_DEPLOY_BACKUP}" ]]; then
    echo "O backup anterior à implantação não foi localizado ou está vazio."
    exit 1
fi
echo "Backup consistente confirmado: ${PRE_DEPLOY_BACKUP}"

echo "[6/8] Iniciando API e aplicando migrações..."

DATABASE_MAY_HAVE_CHANGED=1
docker compose -f "${COMPOSE_FILE}" up -d

echo "[7/8] Aguardando saúde da API..."

API_STATUS="starting"
for _attempt in {1..24}; do
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

echo "[8/8] Executando testes de fumaça e isolamento..."

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

DEPLOYMENT_STARTED=0
DATABASE_MAY_HAVE_CHANGED=0
trap - ERR

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
if [[ -n "${ROLLBACK_IMAGE_TAG}" ]]; then
    echo "Rollback salvo:  ${ROLLBACK_IMAGE_TAG}"
    echo "Backup associado: ${PRE_DEPLOY_BACKUP}"
fi
echo "================================================================"
