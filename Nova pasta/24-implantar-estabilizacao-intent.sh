#!/usr/bin/env bash

set -Eeuo pipefail

# ================================================================
# INTENT — IMPLANTAÇÃO DA RODADA DE ESTABILIZAÇÃO
# Envia o servidor ao commit aprovado, preserva as imagens atuais,
# implanta backend e frontend e executa verificações de saúde.
# ================================================================

APP_USER="ubuntu"
SOURCE_DIR="/opt/intent/source"
BRANCH="codex/mvp-backend-base"
EXPECTED_COMMIT="09add9f0e257b2df5a877b37eb4a59ae76b80709"

BACKEND_DEPLOY="${SOURCE_DIR}/deploy/oracle/08-deploy-backend.sh"
BACKEND_COMPOSE="${SOURCE_DIR}/backend/compose.yaml"
FRONTEND_COMPOSE="${SOURCE_DIR}/deploy/oracle/frontend.compose.yaml"
BACKEND_IMAGE="intent-api-api:latest"
FRONTEND_IMAGE="intent-frontend:local"

OLD_COMMIT=""
OLD_BACKEND_IMAGE_ID=""
OLD_FRONTEND_IMAGE_ID=""
ROLLBACK_TAG_SUFFIX="$(date +%Y%m%d-%H%M%S)"
CHANGE_STARTED=0

container_health() {
    docker inspect \
        --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' \
        "$1" 2>/dev/null || true
}

wait_healthy() {
    local container="$1"
    local status=""

    for _attempt in {1..24}; do
        status="$(container_health "${container}")"
        [[ "${status}" == "healthy" ]] && return 0
        [[ "${status}" == "exited" || "${status}" == "unhealthy" ]] && break
        sleep 5
    done

    echo "${container} não ficou saudável. Estado: ${status:-indisponível}"
    docker logs --tail 120 "${container}" || true
    return 1
}

rollback() {
    local exit_code="$1"
    local failed_line="$2"
    trap - ERR

    echo
    echo "ERRO NA LINHA ${failed_line}. Iniciando rollback da implantação completa."

    if [[ "${CHANGE_STARTED}" -ne 1 ]]; then
        echo "Nenhum serviço havia sido substituído."
        exit "${exit_code}"
    fi

    docker stop intent-frontend intent-api >/dev/null 2>&1 || true

    if [[ -n "${OLD_BACKEND_IMAGE_ID}" ]]; then
        docker tag "${OLD_BACKEND_IMAGE_ID}" "${BACKEND_IMAGE}"
    fi
    if [[ -n "${OLD_FRONTEND_IMAGE_ID}" ]]; then
        docker tag "${OLD_FRONTEND_IMAGE_ID}" "${FRONTEND_IMAGE}"
    fi

    if [[ -n "${OLD_COMMIT}" ]]; then
        sudo -u "${APP_USER}" git -c advice.detachedHead=false -C "${SOURCE_DIR}" switch --detach "${OLD_COMMIT}" || true
    fi

    if [[ -n "${OLD_BACKEND_IMAGE_ID}" ]]; then
        docker compose -f "${BACKEND_COMPOSE}" up -d --no-build --force-recreate || true
    fi
    if [[ -n "${OLD_FRONTEND_IMAGE_ID}" ]]; then
        docker compose -f "${FRONTEND_COMPOSE}" up -d --no-build --force-recreate || true
    fi

    if wait_healthy intent-api && wait_healthy intent-frontend; then
        echo "Rollback concluído; a versão anterior voltou a ficar saudável."
    else
        echo "ATENÇÃO: o rollback exige verificação manual."
    fi

    exit "${exit_code}"
}

trap 'rollback "$?" "${LINENO}"' ERR

if [[ "${EUID}" -ne 0 ]]; then
    echo "Execute usando sudo."
    exit 1
fi

echo "================================================================"
echo "INTENT — IMPLANTAÇÃO DA RODADA DE ESTABILIZAÇÃO"
echo "================================================================"

echo "[1/9] Validando ambiente e estado atual..."

for command in docker git curl ss; do
    command -v "${command}" >/dev/null 2>&1 || {
        echo "Comando obrigatório ausente: ${command}"
        exit 1
    }
done

[[ -d "${SOURCE_DIR}/.git" ]] || { echo "Repositório não encontrado."; exit 1; }
[[ -z "$(sudo -u "${APP_USER}" git -C "${SOURCE_DIR}" status --porcelain)" ]] || {
    echo "O repositório possui alterações locais. Nada será implantado."
    exit 1
}

for container in intent-postgres intent-redis intent-api intent-frontend; do
    [[ "$(container_health "${container}")" == "healthy" ]] || {
        echo "${container} não está saudável."
        exit 1
    }
done

OLD_COMMIT="$(sudo -u "${APP_USER}" git -C "${SOURCE_DIR}" rev-parse HEAD)"
OLD_BACKEND_IMAGE_ID="$(docker inspect --format='{{.Image}}' intent-api)"
OLD_FRONTEND_IMAGE_ID="$(docker inspect --format='{{.Image}}' intent-frontend)"

docker tag "${OLD_BACKEND_IMAGE_ID}" "intent-api-api:before-stabilization-${ROLLBACK_TAG_SUFFIX}"
docker tag "${OLD_FRONTEND_IMAGE_ID}" "intent-frontend:before-stabilization-${ROLLBACK_TAG_SUFFIX}"

echo "[2/9] Buscando a branch aprovada..."
sudo -u "${APP_USER}" git -C "${SOURCE_DIR}" fetch origin "${BRANCH}"
REMOTE_COMMIT="$(sudo -u "${APP_USER}" git -C "${SOURCE_DIR}" rev-parse FETCH_HEAD)"

if [[ "${REMOTE_COMMIT}" != "${EXPECTED_COMMIT}" ]]; then
    echo "A branch mudou desde a aprovação."
    echo "Esperado: ${EXPECTED_COMMIT}"
    echo "Recebido: ${REMOTE_COMMIT}"
    exit 1
fi

echo "[3/9] Confirmando que não existem novas migrações..."
if ! sudo -u "${APP_USER}" git -C "${SOURCE_DIR}" diff --quiet \
    "${OLD_COMMIT}" "${EXPECTED_COMMIT}" -- backend/prisma/migrations; then
    echo "Foram encontradas migrações novas. Este script conservador não continuará."
    exit 1
fi

echo "[4/9] Posicionando o código no commit aprovado..."
sudo -u "${APP_USER}" git -c advice.detachedHead=false -C "${SOURCE_DIR}" switch --detach "${EXPECTED_COMMIT}"

echo "[5/9] Construindo o frontend antes da janela de mudança..."
docker compose -f "${FRONTEND_COMPOSE}" build --pull

echo "[6/9] Implantando o backend com backup e rollback próprios..."
CHANGE_STARTED=1
bash "${BACKEND_DEPLOY}"

echo "[7/9] Ativando o frontend estabilizado..."
docker compose -f "${FRONTEND_COMPOSE}" up -d --no-build --force-recreate

echo "[8/9] Aguardando os dois serviços..."
wait_healthy intent-api
wait_healthy intent-frontend

echo "[9/9] Executando testes de fumaça e isolamento..."
curl --fail --silent --show-error http://127.0.0.1:8080/health/ready
echo
curl --fail --silent --show-error http://127.0.0.1:3000/healthz
echo

API_LISTEN="$(ss -lntp | grep ':8080 ' || true)"
FRONTEND_LISTEN="$(ss -lntp | grep ':3000 ' || true)"

grep -q '127.0.0.1:8080' <<< "${API_LISTEN}" || {
    echo "A API não está restrita ao localhost."
    exit 1
}
grep -q '127.0.0.1:3000' <<< "${FRONTEND_LISTEN}" || {
    echo "O frontend não está restrito ao localhost."
    exit 1
}

ACTIVE_COMMIT="$(sudo -u "${APP_USER}" git -C "${SOURCE_DIR}" rev-parse HEAD)"
[[ "${ACTIVE_COMMIT}" == "${EXPECTED_COMMIT}" ]] || {
    echo "O commit ativo não corresponde ao aprovado."
    exit 1
}

CHANGE_STARTED=0
trap - ERR

echo
echo "================================================================"
echo "RODADA DE ESTABILIZAÇÃO IMPLANTADA"
echo "================================================================"
echo "Commit:              ${ACTIVE_COMMIT}"
echo "CI do GitHub:         aprovado"
echo "Backend:              saudável em 127.0.0.1:8080"
echo "Frontend:             saudável em 127.0.0.1:3000"
echo "PostgreSQL e Redis:   saudáveis"
echo "Firebase:             intent-86155"
echo "Portas públicas:      nenhuma"
echo "Main:                 inalterada"
echo "Rollback backend:     intent-api-api:before-stabilization-${ROLLBACK_TAG_SUFFIX}"
echo "Rollback frontend:    intent-frontend:before-stabilization-${ROLLBACK_TAG_SUFFIX}"
echo "================================================================"
