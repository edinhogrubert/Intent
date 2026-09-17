#!/usr/bin/env bash

set -uo pipefail
export GIT_OPTIONAL_LOCKS=0

# ================================================================
# INTENT — VERIFICAÇÃO COMPLETA DAS REVISÕES SOCIAIS
# Somente leitura: não altera código, banco, firewall ou contêineres.
# ================================================================

SOURCE_DIR="${SOURCE_DIR:-/opt/intent/source}"
GIT_USER="${GIT_USER:-ubuntu}"

OK=0
FAIL=0

pass() {
    echo "OK:    $1"
    OK=$((OK + 1))
}

fail() {
    echo "FALHA: $1"
    FAIL=$((FAIL + 1))
}

echo "================================================================"
echo "INTENT — VERIFICAÇÃO COMPLETA DAS ÚLTIMAS REVISÕES"
echo "================================================================"

if [[ "${EUID}" -ne 0 ]]; then
    echo "Execute usando: sudo ~/21-verificar-intent-completo.sh"
    exit 1
fi

# ls-remote consulta o GitHub sem modificar refs, FETCH_HEAD ou o checkout.
git_read() {
    sudo -u "${GIT_USER}" git -C "${SOURCE_DIR}" "$@"
}
CURRENT_COMMIT="$(git_read rev-parse HEAD 2>/dev/null || true)"
REMOTE_COMMIT="$(git_read ls-remote --exit-code origin refs/heads/main 2>/dev/null | awk '$2 == "refs/heads/main" {print $1}')"

if [[ "${REMOTE_COMMIT}" =~ ^[0-9a-f]{40}$ && "${CURRENT_COMMIT}" == "${REMOTE_COMMIT}" ]]; then
    pass "HEAD implantado alinhado exatamente à origin/main."
else
    fail "HEAD ${CURRENT_COMMIT:-ausente}; origin/main ${REMOTE_COMMIT:-indisponível}. A consulta remota deve funcionar e os commits devem ser iguais."
fi

if LOCAL_STATUS="$(git_read status --porcelain --untracked-files=all 2>/dev/null)" && [[ -z "${LOCAL_STATUS}" ]]; then
    pass "Repositório sem alterações locais."
else
    fail "Existem alterações locais ou não foi possível consultar o repositório."
fi

for CONTAINER in intent-postgres intent-redis intent-api intent-frontend; do
    RUNNING="$(docker inspect --format='{{.State.Running}}' "${CONTAINER}" 2>/dev/null || true)"
    [[ "${RUNNING}" == "true" ]] \
        && pass "Contêiner ${CONTAINER} em execução." \
        || fail "Contêiner ${CONTAINER} não está em execução."
done

for CONTAINER in intent-postgres intent-redis intent-api intent-frontend; do
    HEALTH="$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}sem-healthcheck{{end}}' "${CONTAINER}" 2>/dev/null || true)"
    [[ "${HEALTH}" == "healthy" ]] \
        && pass "Contêiner ${CONTAINER} saudável." \
        || fail "Saúde de ${CONTAINER}: ${HEALTH:-indisponível}."
done

docker exec intent-postgres sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"' >/dev/null 2>&1 \
    && pass "PostgreSQL aceitando conexões." \
    || fail "PostgreSQL não aceitou conexão."

REDIS_RESULT="$(docker exec intent-redis sh -c '
    if [ -n "${REDIS_PASSWORD:-}" ]; then
        REDISCLI_AUTH="$REDIS_PASSWORD" redis-cli ping
    else
        redis-cli ping
    fi
' 2>/dev/null | tr -d '\r' | tail -n1 || true)"
[[ "${REDIS_RESULT}" == "PONG" ]] \
    && pass "Redis respondendo PONG." \
    || fail "Redis não respondeu corretamente: ${REDIS_RESULT:-sem resposta}."

curl -fsS http://127.0.0.1:8080/health/ready >/dev/null \
    && pass "API pronta." \
    || fail "API não respondeu ao health check."

curl -fsS http://127.0.0.1:3000/healthz >/dev/null \
    && pass "Frontend pronto." \
    || fail "Frontend não respondeu ao health check."

PUBLIC_STATUS="$(curl -sS -o /dev/null -w '%{http_code}' 'http://127.0.0.1:8080/v1/intents/feed?scope=public&limit=1' || true)"
[[ "${PUBLIC_STATUS}" == "200" ]] \
    && pass "Feed público respondendo 200." \
    || fail "Feed público retornou HTTP ${PUBLIC_STATUS:-indisponível}."

FOLLOWING_STATUS="$(curl -sS -o /dev/null -w '%{http_code}' 'http://127.0.0.1:8080/v1/intents/feed?scope=following&limit=1' || true)"
[[ "${FOLLOWING_STATUS}" == "401" ]] \
    && pass "Feed Seguindo exige autenticação." \
    || fail "Feed Seguindo sem login retornou HTTP ${FOLLOWING_STATUS:-indisponível}; esperado 401."

docker exec intent-api grep -Rqs "Esta Intent é visível somente para seguidores" /app/dist \
    && pass "Regra de privacidade para seguidores está no backend ativo." \
    || fail "Backend ativo não contém a nova regra de seguidores."

docker exec intent-frontend sh -c 'grep -Rqs "Escolher feed" /usr/share/nginx/html && grep -Rqs "following" /usr/share/nginx/html' \
    && pass "Seletor de feed e escopo following presentes no frontend ativo (checagem estática)." \
    || fail "Frontend ativo não contém o feed Seguindo."

docker exec intent-frontend grep -Rqs "Pessoas reais conectadas a este perfil" /usr/share/nginx/html \
    && pass "Listas de seguidores e seguindo estão no frontend ativo." \
    || fail "Frontend ativo não contém as listas sociais."

API_PORT="$(docker port intent-api 8080/tcp 2>/dev/null || true)"
[[ "${API_PORT}" == "127.0.0.1:8080" ]] \
    && pass "API restrita a 127.0.0.1:8080." \
    || fail "Publicação inesperada da API: ${API_PORT:-nenhuma}."

FRONTEND_PORT="$(docker port intent-frontend 8080/tcp 2>/dev/null || true)"
[[ "${FRONTEND_PORT}" == "127.0.0.1:3000" ]] \
    && pass "Frontend restrito a 127.0.0.1:3000." \
    || fail "Publicação inesperada do frontend: ${FRONTEND_PORT:-nenhuma}."

docker exec intent-api sh -c 'case ",$CORS_ORIGINS," in *,http://localhost:3100,*) exit 0;; *) exit 1;; esac' \
    && pass "Origem localhost:3100 preservada no CORS." \
    || fail "Origem localhost:3100 ausente no CORS."

docker exec intent-api sh -c '[ "$FIREBASE_PROJECT_ID" = "intent-86155" ]' \
    && pass "API usando o Firebase intent-86155." \
    || fail "Projeto Firebase ativo não corresponde a intent-86155."

curl -sSI http://127.0.0.1:3000/ | grep -qi '^Cross-Origin-Opener-Policy: same-origin-allow-popups' \
    && pass "Cabeçalho do login Google preservado." \
    || fail "Cabeçalho COOP do login Google está ausente."

LATEST_BACKUP="$(find /opt/intent/backups/postgres -maxdepth 1 -type f -name '*.dump' -printf '%T@ %p\n' 2>/dev/null | sort -nr | head -n1 | cut -d' ' -f2-)"
[[ -n "${LATEST_BACKUP}" ]] \
    && pass "Backup encontrado: ${LATEST_BACKUP}" \
    || fail "Nenhum backup PostgreSQL foi encontrado."

echo
echo "================================================================"
echo "RESULTADO"
echo "================================================================"
echo "Verificações aprovadas: ${OK}"
echo "Verificações com falha: ${FAIL}"
echo "Commit atual:           ${CURRENT_COMMIT:-indisponível}"
echo "Commit esperado:        ${REMOTE_COMMIT:-indisponível}"

if [[ "${FAIL}" -eq 0 ]]; then
    echo "RESULTADO GERAL: TUDO CERTO"
    exit 0
fi

echo "RESULTADO GERAL: EXISTEM PENDÊNCIAS"
exit 1
