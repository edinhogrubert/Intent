#!/usr/bin/env bash
set -Eeuo pipefail

BASE=/home/grubert/intent-automacao
TARGET="$BASE/intent-executor-PC.sh"
LOCK="$BASE/instalador-executor-PC.lock"
REF="${INTENT_EXECUTOR_REF:-main}"
SRC_URL="${INTENT_EXECUTOR_PC_URL:-https://raw.githubusercontent.com/edinhogrubert/Intent/$REF/scripts/executores/intent-executor-PC.sh}"

mkdir -p "$BASE"
exec 9>"$LOCK"
flock -n 9 || { echo 'ERRO: outro instalador PC em andamento'; exit 1; }

[[ "$(id -un)" == grubert && "$(hostname -s)" == lubuntu ]] || {
  echo 'ERRO: ambiente PC inesperado'
  exit 1
}

for c in curl bash mktemp date chmod cp mv; do
  command -v "$c" >/dev/null || { echo "ERRO: comando ausente: $c"; exit 1; }
done

TMP="$(mktemp "$BASE/.executor-PC.XXXXXX")"
trap 'rm -f "$TMP"' EXIT

curl --fail --silent --show-error --location "$SRC_URL" -o "$TMP"
bash -n "$TMP" || { echo 'ERRO: executor baixado possui sintaxe inválida'; exit 1; }

if [[ -f "$TARGET" ]]; then
  SAVE="$TARGET.pre-interface-$(date +%Y%m%d-%H%M%S).bak"
  cp -p -- "$TARGET" "$SAVE"
  chmod --reference="$TARGET" "$TMP" 2>/dev/null || chmod 0750 "$TMP"
  echo "Backup do executor anterior: $SAVE"
else
  chmod 0750 "$TMP"
fi

mv -f -- "$TMP" "$TARGET"
echo 'OK: executor PC instalado/atualizado.'
bash "$TARGET" list
