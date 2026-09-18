#!/usr/bin/env bash
set -Eeuo pipefail

BASE=/home/ubuntu/intent-automacao
TARGET=/home/ubuntu/intent-executor-VM.sh
LOCK="$BASE/instalador-executor-VM.lock"
SRC_URL="${INTENT_EXECUTOR_VM_URL:-https://raw.githubusercontent.com/edinhogrubert/Intent/docs/contratos-agentes/scripts/executores/intent-executor-VM.sh}"

mkdir -p "$BASE"
exec 9>"$LOCK"
flock -n 9 || { echo 'ERRO: outro instalador VM em andamento'; exit 1; }

[[ "$(id -un)" == ubuntu && "$(hostname -s)" == intent-app-01 ]] || {
  echo 'ERRO: ambiente VM inesperado'
  exit 1
}

for c in curl bash mktemp date chmod cp mv; do
  command -v "$c" >/dev/null || { echo "ERRO: comando ausente: $c"; exit 1; }
done

TMP="$(mktemp "$BASE/.executor-VM.XXXXXX")"
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
echo 'OK: executor VM instalado/atualizado.'
bash "$TARGET" list
