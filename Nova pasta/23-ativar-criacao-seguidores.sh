#!/usr/bin/env bash

set -Eeuo pipefail

# ================================================================
# INTENT — ATIVAR CRIAÇÃO PARA SEGUIDORES
# Atualiza somente o frontend e a documentação para o commit abaixo.
# Não altera banco, Firebase, firewall, backend ou a branch main.
# ================================================================

# Usuário proprietário do clone Git.
APP_USER="ubuntu"
# Diretório do repositório na VM.
SOURCE_DIR="/opt/intent/source"
# Branch aprovada do MVP.
SOURCE_BRANCH="codex/mvp-backend-base"
# Commit exato que será implantado.
EXPECTED_COMMIT="3684ff02378d844e56bff924cf5920c43b5ef132"
# Compose do frontend.
FRONTEND_COMPOSE="/opt/intent/source/deploy/oracle/frontend.compose.yaml"
# Contêiner e imagens para rollback.
FRONTEND_CONTAINER="intent-frontend"
FRONTEND_IMAGE="intent-frontend:local"
ROLLBACK_IMAGE="intent-frontend:before-create-followers"
# Verificação de saúde.
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
    echo "Falha na linha ${failed_line}. Restaurando o frontend anterior..."

    if [[ "${ROLLBACK_READY}" -eq 1 ]]; then
        docker image tag "${ROLLBACK_IMAGE}" "${FRONTEND_IMAGE}"
        docker compose -f "${FRONTEND_COMPOSE}" up -d --no-build
    fi

    if [[ -n "${PREVIOUS_COMMIT}" ]]; then
        sudo -u "${APP_USER}" git -C "${SOURCE_DIR}" switch --detach "${PREVIOUS_COMMIT}"
    fi

    echo "Rollback concluído. Backend, banco e Firebase permaneceram inalterados."
    exit "${exit_code}"
}

trap 'rollback ${LINENO}' ERR

if [[ "${EUID}" -ne 0 ]]; then
    echo "Execute usando: sudo ~/23-ativar-criacao-seguidores.sh"
    exit 1
fi

echo "================================================================"
echo "INTENT — ATIVAÇÃO DA CRIAÇÃO PARA SEGUIDORES"
echo "================================================================"

echo "[1/7] Validando ambiente..."
for command in git docker curl ss; do
    command -v "${command}" >/dev/null || { echo "Comando ausente: ${command}"; exit 1; }
done

[[ -d "${SOURCE_DIR}/.git" ]] || { echo "Repositório ausente: ${SOURCE_DIR}"; exit 1; }
[[ -f "${FRONTEND_COMPOSE}" ]] || { echo "Compose ausente: ${FRONTEND_COMPOSE}"; exit 1; }

if [[ -n "$(sudo -u "${APP_USER}" git -C "${SOURCE_DIR}" status --porcelain)" ]]; then
    echo "O repositório possui alterações locais. Nada será implantado."
    exit 1
fi

PREVIOUS_COMMIT="$(sudo -u "${APP_USER}" git -C "${SOURCE_DIR}" rev-parse HEAD)"

echo "[2/7] Confirmando o frontend atual..."
[[ "$(docker inspect --format='{{.State.Running}}' "${FRONTEND_CONTAINER}" 2>/dev/null || true)" == "true" ]] || {
    echo "Frontend não está em execução."
    exit 1
}

curl --fail --silent --show-error http://127.0.0.1:3000/healthz >/dev/null
curl --fail --silent --show-error http://127.0.0.1:8080/health/ready >/dev/null

echo "[3/7] Buscando e conferindo o commit aprovado..."
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
echo "Branch:       ${SOURCE_BRANCH}"
echo "Commit:       ${EXPECTED_COMMIT}"
echo "Alteração:    escolha Pública ou Somente seguidores"
echo "Banco:        inalterado"
echo "Backend:      inalterado"
echo "Firebase:     inalterado"
echo "Main:         inalterada"
echo
read -r -p "Digite ATIVAR para continuar: " CONFIRMATION
[[ "${CONFIRMATION}" == "ATIVAR" ]] || { echo "Operação cancelada."; exit 0; }

echo "[4/7] Preservando o frontend atual para rollback..."
docker image tag "$(docker inspect --format='{{.Image}}' "${FRONTEND_CONTAINER}")" "${ROLLBACK_IMAGE}"
ROLLBACK_READY=1

echo "[5/7] Posicionando o código no commit aprovado..."
sudo -u "${APP_USER}" git -C "${SOURCE_DIR}" switch --detach "${EXPECTED_COMMIT}"

echo "[6/7] Executando lint, TypeScript e build do frontend ARM64..."
docker compose -f "${FRONTEND_COMPOSE}" build
docker compose -f "${FRONTEND_COMPOSE}" up -d --no-build

echo "[7/7] Verificando a versão ativa e o isolamento..."
FRONTEND_HEALTH="starting"
for ((attempt=1; attempt<=HEALTH_ATTEMPTS; attempt++)); do
    FRONTEND_HEALTH="$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "${FRONTEND_CONTAINER}" 2>/dev/null || true)"
    [[ "${FRONTEND_HEALTH}" == "healthy" ]] && break
    sleep "${HEALTH_INTERVAL_SECONDS}"
done

if [[ "${FRONTEND_HEALTH}" != "healthy" ]]; then
    docker logs --tail 120 "${FRONTEND_CONTAINER}" || true
    exit 1
fi

curl --fail --silent --show-error http://127.0.0.1:3000/healthz >/dev/null
curl --fail --silent --show-error http://127.0.0.1:8080/health/ready >/dev/null

docker exec "${FRONTEND_CONTAINER}" grep -Rqs "Somente seguidores" /usr/share/nginx/html || {
    echo "A opção Somente seguidores não foi encontrada no frontend ativo."
    exit 1
}

docker exec "${FRONTEND_CONTAINER}" grep -Rqs "Ao deixar de seguir, a pessoa perde o acesso" /usr/share/nginx/html || {
    echo "A explicação de privacidade não foi encontrada no frontend ativo."
    exit 1
}

FRONTEND_PORT="$(docker port "${FRONTEND_CONTAINER}" 8080/tcp 2>/dev/null || true)"
[[ "${FRONTEND_PORT}" == "127.0.0.1:3000" ]] || {
    echo "Publicação inesperada do frontend: ${FRONTEND_PORT:-nenhuma}."
    exit 1
}

[[ "$(sudo -u "${APP_USER}" git -C "${SOURCE_DIR}" rev-parse HEAD)" == "${EXPECTED_COMMIT}" ]] || {
    echo "O repositório não permaneceu no commit aprovado."
    exit 1
}

trap - ERR

echo
echo "================================================================"
echo "CRIAÇÃO PARA SEGUIDORES ATIVADA"
echo "================================================================"
echo "Commit:             ${EXPECTED_COMMIT}"
echo "Opção Pública:      disponível"
echo "Somente seguidores: disponível"
echo "Prévia:             mostra a audiência escolhida"
echo "Backend e banco:    inalterados e saudáveis"
echo "Firebase:           inalterado"
echo "Main:               inalterada"
echo "Portas públicas:    nenhuma"
echo "Rollback frontend:  ${ROLLBACK_IMAGE}"
echo "================================================================"
