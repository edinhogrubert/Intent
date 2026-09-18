#!/usr/bin/env bash

set -Eeuo pipefail

# ================================================================
# INTENT — ATIVAR FEED "SEGUINDO"
# Atualiza backend e frontend para o commit aprovado abaixo.
# Mantém API e frontend restritos ao localhost e não altera a main.
# ================================================================

# Usuário proprietário do clone Git.
APP_USER="ubuntu"
# Diretório do código já clonado na VM.
SOURCE_DIR="/opt/intent/source"
# Branch aprovada do MVP.
SOURCE_BRANCH="codex/mvp-backend-base"
# Commit exato que será implantado.
EXPECTED_COMMIT="a859de7bdcd5633233597120ec19b3f49f80da56"
# Script de backup PostgreSQL já validado.
BACKUP_SCRIPT="/opt/intent/scripts/executar-backup-postgres.sh"
# Arquivos Compose existentes.
BACKEND_COMPOSE="/opt/intent/source/backend/compose.yaml"
FRONTEND_COMPOSE="/opt/intent/source/deploy/oracle/frontend.compose.yaml"
# Contêineres e imagens usados no rollback.
API_CONTAINER="intent-api"
FRONTEND_CONTAINER="intent-frontend"
API_IMAGE="intent-api-api:latest"
FRONTEND_IMAGE="intent-frontend:local"
API_ROLLBACK_IMAGE="intent-api-api:before-following-feed"
FRONTEND_ROLLBACK_IMAGE="intent-frontend:before-following-feed"
# Quantidade e intervalo das verificações de saúde.
HEALTH_ATTEMPTS=30
HEALTH_INTERVAL_SECONDS=4

PREVIOUS_COMMIT=""
ROLLBACK_READY=0

rollback() {
    local exit_code=$?
    local failed_line=${1:-desconhecida}
    trap - ERR
    set +e

    echo
    echo "Falha na linha ${failed_line}. Iniciando rollback seguro..."

    if [[ "${ROLLBACK_READY}" -eq 1 ]]; then
        docker image tag "${API_ROLLBACK_IMAGE}" "${API_IMAGE}"
        docker image tag "${FRONTEND_ROLLBACK_IMAGE}" "${FRONTEND_IMAGE}"
        docker compose -f "${BACKEND_COMPOSE}" up -d --no-build
        docker compose -f "${FRONTEND_COMPOSE}" up -d --no-build
    fi

    if [[ -n "${PREVIOUS_COMMIT}" ]]; then
        sudo -u "${APP_USER}" git -C "${SOURCE_DIR}" switch --detach "${PREVIOUS_COMMIT}"
    fi

    echo "Rollback concluído. Verifique os logs dos contêineres."
    exit "${exit_code}"
}

trap 'rollback ${LINENO}' ERR

if [[ "${EUID}" -ne 0 ]]; then
    echo "Execute usando sudo: sudo ~/20-ativar-feed-seguindo.sh"
    exit 1
fi

echo "================================================================"
echo "INTENT — ATIVAÇÃO DO FEED SEGUINDO"
echo "================================================================"

echo "[1/9] Validando ambiente..."
for command in git docker curl ss; do
    command -v "${command}" >/dev/null || { echo "Comando ausente: ${command}"; exit 1; }
done
for required in "${SOURCE_DIR}/.git" "${BACKEND_COMPOSE}" "${FRONTEND_COMPOSE}" "${BACKUP_SCRIPT}"; do
    [[ -e "${required}" ]] || { echo "Arquivo ou diretório ausente: ${required}"; exit 1; }
done
[[ -x "${BACKUP_SCRIPT}" ]] || { echo "Backup não está executável: ${BACKUP_SCRIPT}"; exit 1; }

if [[ -n "$(sudo -u "${APP_USER}" git -C "${SOURCE_DIR}" status --porcelain)" ]]; then
    echo "O repositório possui alterações locais. Nada será implantado."
    exit 1
fi

PREVIOUS_COMMIT="$(sudo -u "${APP_USER}" git -C "${SOURCE_DIR}" rev-parse HEAD)"

echo "[2/9] Confirmando serviços atuais..."
for container in intent-postgres intent-redis "${API_CONTAINER}" "${FRONTEND_CONTAINER}"; do
    [[ "$(docker inspect --format='{{.State.Running}}' "${container}" 2>/dev/null || true)" == "true" ]] || {
        echo "Contêiner não está em execução: ${container}"
        exit 1
    }
done
[[ "$(docker inspect --format='{{.State.Health.Status}}' intent-postgres)" == "healthy" ]] || {
    echo "PostgreSQL não está saudável."
    exit 1
}

echo "[3/9] Buscando e conferindo o commit aprovado..."
sudo -u "${APP_USER}" git -C "${SOURCE_DIR}" fetch origin "${SOURCE_BRANCH}"
REMOTE_COMMIT="$(sudo -u "${APP_USER}" git -C "${SOURCE_DIR}" rev-parse FETCH_HEAD)"
if [[ "${REMOTE_COMMIT}" != "${EXPECTED_COMMIT}" ]]; then
    echo "A branch mudou desde a aprovação."
    echo "Esperado: ${EXPECTED_COMMIT}"
    echo "Recebido: ${REMOTE_COMMIT}"
    exit 1
fi

echo
echo "Será implantado:"
echo "Branch:  ${SOURCE_BRANCH}"
echo "Commit:  ${EXPECTED_COMMIT}"
echo "Recurso: feed Para você / Seguindo e privacidade para seguidores"
echo "Main:     não será alterada"
echo
read -r -p "Digite ATIVAR para continuar: " CONFIRMATION
[[ "${CONFIRMATION}" == "ATIVAR" ]] || { echo "Operação cancelada."; exit 0; }

echo "[4/9] Criando backup do PostgreSQL..."
"${BACKUP_SCRIPT}"

echo "[5/9] Preservando imagens atuais para rollback..."
docker image tag "$(docker inspect --format='{{.Image}}' "${API_CONTAINER}")" "${API_ROLLBACK_IMAGE}"
docker image tag "$(docker inspect --format='{{.Image}}' "${FRONTEND_CONTAINER}")" "${FRONTEND_ROLLBACK_IMAGE}"
ROLLBACK_READY=1

echo "[6/9] Posicionando o código no commit aprovado..."
sudo -u "${APP_USER}" git -C "${SOURCE_DIR}" switch --detach "${EXPECTED_COMMIT}"

echo "[7/9] Construindo backend e frontend ARM64..."
docker compose -f "${BACKEND_COMPOSE}" build
docker compose -f "${FRONTEND_COMPOSE}" build

echo "[8/9] Atualizando os serviços..."
docker compose -f "${BACKEND_COMPOSE}" up -d --no-build
docker compose -f "${FRONTEND_COMPOSE}" up -d --no-build

echo "[9/9] Executando verificações de saúde e isolamento..."
for ((attempt=1; attempt<=HEALTH_ATTEMPTS; attempt++)); do
    API_HEALTH="$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "${API_CONTAINER}" 2>/dev/null || true)"
    FRONTEND_HEALTH="$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "${FRONTEND_CONTAINER}" 2>/dev/null || true)"
    if [[ "${API_HEALTH}" == "healthy" && "${FRONTEND_HEALTH}" == "healthy" ]]; then
        break
    fi
    sleep "${HEALTH_INTERVAL_SECONDS}"
done

[[ "${API_HEALTH}" == "healthy" ]] || { docker logs --tail 120 "${API_CONTAINER}"; exit 1; }
[[ "${FRONTEND_HEALTH}" == "healthy" ]] || { docker logs --tail 120 "${FRONTEND_CONTAINER}"; exit 1; }

curl --fail --silent --show-error http://127.0.0.1:8080/health/ready
echo
curl --fail --silent --show-error 'http://127.0.0.1:8080/v1/intents/feed?scope=public&limit=1' >/dev/null
FOLLOWING_STATUS="$(curl --silent --output /dev/null --write-out '%{http_code}' 'http://127.0.0.1:8080/v1/intents/feed?scope=following&limit=1')"
[[ "${FOLLOWING_STATUS}" == "401" ]] || { echo "Feed Seguindo sem login retornou ${FOLLOWING_STATUS}, esperado 401."; exit 1; }

LISTENING="$(ss -lnt | grep -E ':(3000|8080)[[:space:]]' || true)"
if grep -Eq '(^|[[:space:]])(0\.0\.0\.0|\*):(3000|8080)' <<< "${LISTENING}"; then
    echo "Uma porta da aplicação foi exposta publicamente."
    exit 1
fi

trap - ERR

echo
echo "================================================================"
echo "FEED SEGUINDO ATIVADO"
echo "================================================================"
echo "Commit:             ${EXPECTED_COMMIT}"
echo "Para você:          somente Intents públicas reais"
echo "Seguindo:           Intents públicas e para seguidores"
echo "Privacidade:        acesso validado pelo vínculo real"
echo "Paginação:          20 itens por página"
echo "Backend e frontend: saudáveis"
echo "Main:               inalterada"
echo "Portas públicas:    nenhuma"
echo "Rollback backend:   ${API_ROLLBACK_IMAGE}"
echo "Rollback frontend:  ${FRONTEND_ROLLBACK_IMAGE}"
echo "================================================================"
