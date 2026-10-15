#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
SCRIPT_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ENVIRONMENT="${1:-}"
[[ "$ENVIRONMENT" == pc || "$ENVIRONMENT" == vm ]] || { echo 'Uso: bash script/intent.sh pc|vm list|--plan|1..15 [números]'; exit 2; }
shift
BASE="${INTENT_BASE:-$HOME/intent-automacao}"
if [[ "$ENVIRONMENT" == pc ]]; then REPO="${INTENT_REPO:-/home/grubert/Projetos/Intent-local}"; else REPO="${INTENT_REPO:-/opt/intent/source}"; fi
BACKUP_DIR="$BASE/backups/git"
POSTGRES_BACKUP_DIR="${INTENT_POSTGRES_BACKUP_DIR:-/opt/intent/backups/postgres}"
POSTGRES_BACKUP_SCRIPT="${INTENT_POSTGRES_BACKUP_SCRIPT:-/opt/intent/scripts/executar-backup-postgres.sh}"
LEGACY_BACKUP_SCRIPT="$BASE/intent-backup-git-PC.sh"
IDS=(1 2 3 4 5 6 7 8 9 10 11 12 13 14 15)
declare -A STATUS DETAIL
for module in comum git backup docker; do source "$SCRIPT_ROOT/lib/$module.sh"; done
source "$SCRIPT_ROOT/acoes/$ENVIRONMENT.sh"
[[ "${1:-}" == list ]] && { list; exit 0; }
[[ "${1:-}" == --plan ]] && { echo "Plano para $ENVIRONMENT: ${*:2}; nenhuma ação executada. Consulte MANUAL.md para efeitos."; list; exit 0; }
[[ $# -gt 0 ]] || { list; exit 2; }
for id in "$@"; do [[ "$id" =~ ^([1-9]|1[0-5])$ ]] || { echo "Função inválida: $id"; exit 2; }; done
require_environment
mkdir -p "$BASE/relatorios" "$BACKUP_DIR"
exec 9>"$BASE/executor-$ENVIRONMENT.lock"
flock -n 9 || { echo 'Outro executor em andamento'; exit 1; }
LOG="$(mktemp "$BASE/relatorios/$ENVIRONMENT-XXXXXXXX.log")"
# Não chamar funções em condição ||/if: isso desativa errexit em seus corpos.
trap 'rc=$?; echo "ERRO função ${id:-inicialização}, rc=$rc; relatório: $LOG"; exit "$rc"' ERR
exec > >(tee -a "$LOG") 2>&1
for id in "$@"; do
  "task_$id"
done
printf 'Relatório: %s\n' "$LOG"
