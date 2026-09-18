#!/usr/bin/env bash

set -u

# ================================================================
# INTENT — VERIFICAÇÃO RÁPIDA DO FEED SEGUINDO
# Somente leitura: execute depois do script 20.
# ================================================================

EXPECTED_COMMIT="a859de7bdcd5633233597120ec19b3f49f80da56"
SOURCE_DIR="/opt/intent/source"
FAIL=0

check() {
    local label="$1"
    shift
    if "$@"; then
        echo "OK:    ${label}"
    else
        echo "FALHA: ${label}"
        FAIL=$((FAIL + 1))
    fi
}

if [[ "${EUID}" -ne 0 ]]; then
    echo "Execute usando: sudo ~/22-verificar-feed-seguindo.sh"
    exit 1
fi

echo "================================================================"
echo "INTENT — VERIFICAÇÃO RÁPIDA DO FEED SEGUINDO"
echo "================================================================"

CURRENT_COMMIT="$(git -C "${SOURCE_DIR}" rev-parse HEAD 2>/dev/null || true)"
if [[ "${CURRENT_COMMIT}" == "${EXPECTED_COMMIT}" ]]; then
    echo "OK:    Commit correto: ${CURRENT_COMMIT}"
else
    echo "FALHA: Commit atual ${CURRENT_COMMIT:-ausente}; esperado ${EXPECTED_COMMIT}"
    FAIL=$((FAIL + 1))
fi

check "API saudável." curl -fsS http://127.0.0.1:8080/health/ready
echo
check "Frontend saudável." curl -fsS http://127.0.0.1:3000/healthz
echo

PUBLIC_STATUS="$(curl -sS -o /dev/null -w '%{http_code}' 'http://127.0.0.1:8080/v1/intents/feed?scope=public&limit=1' || true)"
if [[ "${PUBLIC_STATUS}" == "200" ]]; then
    echo "OK:    Feed Para você respondeu HTTP 200."
else
    echo "FALHA: Feed Para você respondeu HTTP ${PUBLIC_STATUS:-indisponível}."
    FAIL=$((FAIL + 1))
fi

FOLLOWING_STATUS="$(curl -sS -o /dev/null -w '%{http_code}' 'http://127.0.0.1:8080/v1/intents/feed?scope=following&limit=1' || true)"
if [[ "${FOLLOWING_STATUS}" == "401" ]]; then
    echo "OK:    Feed Seguindo está protegido por autenticação."
else
    echo "FALHA: Feed Seguindo sem login respondeu HTTP ${FOLLOWING_STATUS:-indisponível}; esperado 401."
    FAIL=$((FAIL + 1))
fi

check "Backend contém a regra de acesso para seguidores." \
    docker exec intent-api grep -Rqs "Esta Intent é visível somente para seguidores" /app/dist

check "Frontend contém a aba Seguindo." \
    docker exec intent-frontend grep -Rqs "Intents das pessoas que você segue" /usr/share/nginx/html

API_PORT="$(docker port intent-api 8080/tcp 2>/dev/null || true)"
FRONTEND_PORT="$(docker port intent-frontend 8080/tcp 2>/dev/null || true)"

if [[ "${API_PORT}" == "127.0.0.1:8080" && "${FRONTEND_PORT}" == "127.0.0.1:3000" ]]; then
    echo "OK:    API e frontend continuam restritos ao localhost."
else
    echo "FALHA: Publicação inesperada: API=${API_PORT:-nenhuma}; frontend=${FRONTEND_PORT:-nenhuma}."
    FAIL=$((FAIL + 1))
fi

echo
echo "================================================================"
if [[ "${FAIL}" -eq 0 ]]; then
    echo "RESULTADO: FEED SEGUINDO ATIVADO CORRETAMENTE"
    echo "================================================================"
    exit 0
fi

echo "RESULTADO: ${FAIL} PENDÊNCIA(S) ENCONTRADA(S)"
echo "================================================================"
exit 1
