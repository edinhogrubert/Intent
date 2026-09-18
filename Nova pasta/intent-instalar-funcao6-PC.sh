#!/usr/bin/env bash
set -Eeuo pipefail
BASE=/home/grubert/intent-automacao
TARGET="$BASE/intent-executor-PC.sh"
BACKUP_SCRIPT="$BASE/intent-backup-git-PC.sh"
LOCK="$BASE/instalador.lock"
mkdir -p "$BASE"
exec 9>"$LOCK"
flock -n 9 || { echo 'ERRO: outro instalador em andamento'; exit 1; }
[[ "$(id -un)" == grubert && "$(hostname -s)" == lubuntu ]] || { echo 'ERRO: ambiente PC inesperado'; exit 1; }
[[ -f "$TARGET" && -f "$BACKUP_SCRIPT" ]] || { echo 'ERRO: arquivos existentes nao encontrados'; exit 1; }
bash -n "$TARGET" && bash -n "$BACKUP_SCRIPT" || { echo 'ERRO: sintaxe dos arquivos existentes'; exit 1; }
if grep -q '6) echo "Criar e validar backup Git"' "$TARGET"; then
  echo 'Funcao 6 ja consta no executor. Nenhuma alteracao realizada.'
  bash "$TARGET" list
  exit 0
fi
STAMP=$(date +%Y%m%d-%H%M%S)
SAVE="$BASE/intent-executor-PC.sh.pre-funcao6-$STAMP.bak"
cp -p -- "$TARGET" "$SAVE"
TMP=$(mktemp "$BASE/.executor-update.XXXXXX")
trap 'rm -f -- "$TMP"' EXIT
python3 - "$TARGET" "$TMP" <<'PY'
import sys
from pathlib import Path
src=Path(sys.argv[1]).read_text()
def once(old,new):
 global src
 n=src.count(old)
 if n!=1: raise SystemExit(f'ERRO: estrutura inesperada, ocorrencias={n}: {old!r}')
 src=src.replace(old,new,1)
once('IDS=(1 2 3 4 5)','IDS=(1 2 3 4 5 6)')
once('        5) echo "Validar backup Git bundle existente" ;;','        5) echo "Validar backup Git bundle existente" ;;\n        6) echo "Criar e validar backup Git" ;;')
once('        3|5) echo 2 ;;','        3|5) echo 2 ;;\n        6) echo 3 ;;')
func='''task_6() {
    local script="/home/grubert/intent-automacao/intent-backup-git-PC.sh"
    run_task 4
    if [[ "${STATUS[4]}" != "OK" ]]; then
        DETAIL[6]="Verificacao de espaco nao aprovada"
        return 1
    fi
    [[ -f "$script" ]] || { DETAIL[6]="Script de backup ausente"; return 1; }
    bash -n "$script" || { DETAIL[6]="Sintaxe do backup invalida"; return 1; }
    if bash "$script"; then
        DETAIL[6]="Backup Git criado e validado"
        return 0
    fi
    DETAIL[6]="Backup Git falhou"
    return 1
}

'''
once('run_task() {',func+'run_task() {')
once('        1|2|3|4|5) ;;','        1|2|3|4|5|6) ;;')
Path(sys.argv[2]).write_text(src)
PY
bash -n "$TMP" || { echo 'ERRO: atualizacao gerou sintaxe invalida; original preservado'; exit 1; }
chmod --reference="$TARGET" "$TMP"
mv -f -- "$TMP" "$TARGET"
echo "OK: funcao 6 instalada. Copia anterior: $SAVE"
bash "$TARGET" list
