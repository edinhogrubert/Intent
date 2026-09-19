#!/usr/bin/env bash

set -Eeuo pipefail

# Implantação isolada do frontend. PostgreSQL, Redis e API não são recriados.
BASE_DIR=/opt/intent
SOURCE_DIR="$BASE_DIR/source"
COMPOSE_FILE="$SOURCE_DIR/deploy/oracle/frontend.compose.yaml"
FRONTEND_CONTAINER=intent-frontend
FRONTEND_IMAGE=intent-frontend:local
ROLLBACK_IMAGE_TAG=""
DEPLOYMENT_STARTED=0

rollback_on_error() {
  local exit_code="$1" failed_line="$2" status=""
  trap - ERR
  echo "ERRO NA LINHA $failed_line. Iniciando recuperação do frontend."
  [[ "$DEPLOYMENT_STARTED" -eq 1 ]] || exit "$exit_code"
  if [[ -z "$ROLLBACK_IMAGE_TAG" ]] || ! docker image inspect "$ROLLBACK_IMAGE_TAG" >/dev/null 2>&1; then
    echo 'Imagem anterior indisponível; frontend permanece parado para diagnóstico.'
    exit "$exit_code"
  fi
  docker tag "$ROLLBACK_IMAGE_TAG" "$FRONTEND_IMAGE"
  docker compose -f "$COMPOSE_FILE" up -d --no-build --force-recreate frontend || true
  for _attempt in {1..24}; do
    status="$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$FRONTEND_CONTAINER" 2>/dev/null || true)"
    [[ "$status" == healthy ]] && break
    sleep 5
  done
  [[ "$status" == healthy ]] && echo 'Rollback do frontend concluído.' || echo "Rollback do frontend incompleto: ${status:-indisponível}."
  exit "$exit_code"
}
trap 'rollback_on_error "$?" "$LINENO"' ERR

[[ "$EUID" -eq 0 ]] || { echo 'Execute usando sudo.'; exit 1; }
for command in docker curl ss; do command -v "$command" >/dev/null 2>&1 || { echo "Comando obrigatório ausente: $command"; exit 1; }; done
for required in "$COMPOSE_FILE" "$SOURCE_DIR/deploy/oracle/frontend.Dockerfile"; do [[ -f "$required" ]] || { echo "Arquivo obrigatório ausente: $required"; exit 1; }; done
[[ -d "$SOURCE_DIR/.git" ]] || { echo "Repositório Git ausente: $SOURCE_DIR"; exit 1; }
[[ -z "$(git -C "$SOURCE_DIR" status --porcelain)" ]] || { echo 'Repositório possui alterações locais; nada será implantado.'; exit 1; }
docker network inspect intent-edge >/dev/null

CURRENT_IMAGE_ID="$(docker inspect --format='{{.Image}}' "$FRONTEND_CONTAINER" 2>/dev/null || true)"
if [[ -n "$CURRENT_IMAGE_ID" ]]; then
  ROLLBACK_IMAGE_TAG="intent-frontend:rollback-$(date +%Y%m%d-%H%M%S)"
  docker tag "$CURRENT_IMAGE_ID" "$ROLLBACK_IMAGE_TAG"
  echo "Imagem anterior preservada em $ROLLBACK_IMAGE_TAG."
fi

docker compose -f "$COMPOSE_FILE" build --pull frontend
DEPLOYMENT_STARTED=1
docker compose -f "$COMPOSE_FILE" up -d --no-build --force-recreate frontend

status=starting
for _attempt in {1..24}; do
  status="$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$FRONTEND_CONTAINER" 2>/dev/null || true)"
  [[ "$status" == healthy ]] && break
  [[ "$status" == exited || "$status" == unhealthy ]] && break
  sleep 5
done
[[ "$status" == healthy ]] || { docker logs --tail 120 "$FRONTEND_CONTAINER" || true; false; }
curl --fail --silent --show-error http://127.0.0.1:3000/healthz >/dev/null
LISTEN_ADDRESS="$(ss -lntp | grep ':3000 ' || true)"
if grep -Eq '(^|[[:space:]])(0\.0\.0\.0|\*):3000' <<< "$LISTEN_ADDRESS"; then
  echo 'Frontend exposto em todas as interfaces.'; false
fi

DEPLOYMENT_STARTED=0
trap - ERR
echo 'Frontend implantado internamente e saudável em 127.0.0.1:3000.'
