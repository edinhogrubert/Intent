#!/usr/bin/env bash
set -Eeuo pipefail
REMOTE="ubuntu@157.151.255.227"
KEY="${HOME}/.ssh/id_ed25519"
[[ -r "$KEY" ]] || { echo "ERRO: chave SSH nao encontrada: $KEY"; exit 1; }
echo "Conectando a $REMOTE e instalando funcao 5 (sem executar backup)..."
ssh -i "$KEY" -o IdentitiesOnly=yes -o BatchMode=yes -o ConnectTimeout=12 "$REMOTE" 'bash -s' <<'REMOTE_SCRIPT'
#!/usr/bin/env bash
set -Eeuo pipefail
TARGET=/home/ubuntu/intent-executor-VM.sh
RUNNER=/opt/intent/scripts/executar-backup-postgres.sh
[[ "$(id -un)" == ubuntu && "$(hostname -s)" == intent-app-01 ]] || { echo 'ERRO: VM ou usuario inesperado'; exit 1; }
[[ -f "$TARGET" && -f "$RUNNER" ]] || { echo 'ERRO: executor ou rotina de backup ausente'; exit 1; }
bash -n "$TARGET" && bash -n "$RUNNER" || { echo 'ERRO: sintaxe dos scripts existentes'; exit 1; }
TMP="$(mktemp /home/ubuntu/.intent-executor-VM.XXXXXXXX.sh)"
trap 'rm -f "$TMP"' EXIT
python3 - "$TARGET" "$TMP" <<'PY'
from pathlib import Path
import sys
src=Path(sys.argv[1]); dest=Path(sys.argv[2]); s=src.read_text()
if 'task_5()' in s or 'TASKS=(1 2 3 4 5)' in s:
    raise SystemExit('ERRO: tarefa 5 ja existe; nenhuma alteracao aplicada')
changes=[
 ('# Operacoes exclusivamente de leitura.', '# Tarefas 1-4 somente leitura; tarefa 5 cria backup PostgreSQL.'),
 ('TASKS=(1 2 3 4)', 'TASKS=(1 2 3 4 5)'),
 ('        4) echo "Verificar endpoints" ;;', '        4) echo "Verificar endpoints" ;;\n        5) echo "Criar e validar backup PostgreSQL" ;;'),
 ('        4) echo 3 ;;', '        4) echo 3 ;;\n        5) echo 3 ;;'),
 ('        1|2|3|4) ;;', '        1|2|3|4|5) ;;'),
 ('echo "INTENT EXECUTOR VM v1"', 'echo "INTENT EXECUTOR VM v1 + backup PostgreSQL"'),
]
for old,new in changes:
    n=s.count(old)
    if n!=1: raise SystemExit(f'ERRO: estrutura inesperada para {old!r} ({n} ocorrencias); nenhuma alteracao aplicada')
    s=s.replace(old,new,1)
anchor='execute_task() {'
if s.count(anchor)!=1: raise SystemExit('ERRO: funcao execute_task nao localizada; nenhuma alteracao aplicada')
function=r'''task_5() {
    local runner="/opt/intent/scripts/executar-backup-postgres.sh"
    local directory="/opt/intent/backups/postgres"
    local before after newfile checksum

    [[ -f "$runner" ]] || { DETAILS[5]="Rotina PostgreSQL ausente"; return 1; }
    bash -n "$runner" || { DETAILS[5]="Sintaxe invalida na rotina PostgreSQL"; return 1; }
    # O backup e seus arquivos sao root:docker; usar sudo nao interativo.
    before="$(sudo -n find "$directory" -maxdepth 1 -type f -name 'intent_*.dump' -printf '%f\n' | sort)" || {
        DETAILS[5]="Nao foi possivel listar backups existentes via sudo"; return 1;
    }
    if ! sudo -n bash "$runner"; then
        DETAILS[5]="Rotina PostgreSQL falhou ou sudo exige senha"
        return 1
    fi
    after="$(sudo -n find "$directory" -maxdepth 1 -type f -name 'intent_*.dump' -printf '%f\n' | sort)" || {
        DETAILS[5]="Nao foi possivel listar backups apos execucao"; return 1;
    }
    newfile="$(comm -13 <(printf '%s\n' "$before" | sed '/^$/d') <(printf '%s\n' "$after" | sed '/^$/d'))"
    if [[ -z "$newfile" || "$newfile" == *$'\n'* ]]; then
        DETAILS[5]="Nao foi identificado exatamente um novo dump; possivel backup concorrente"
        return 1
    fi
    checksum="$directory/$newfile.sha256"
    if ! sudo -n test -s "$directory/$newfile" || ! sudo -n test -s "$checksum"; then
        DETAILS[5]="Dump ou arquivo SHA-256 ausente/vazio"; return 1
    fi
    if ! (cd "$directory" && sudo -n sha256sum -c "$checksum"); then
        DETAILS[5]="Checksum do novo backup nao confere"; return 1
    fi
    DETAILS[5]="Novo backup criado e SHA-256 validado: $newfile"
}

'''
s=s.replace(anchor,function+anchor,1)
# 'resume' is for read-only tasks only. Prevent implicit repeat of a backup.
anchor2='        mapfile -t REQUEST < "$BASE/ultima-solicitacao.txt"\n        ;;'
if s.count(anchor2)!=1: raise SystemExit('ERRO: bloco resume inesperado; nenhuma alteracao aplicada')
s=s.replace(anchor2,'        mapfile -t REQUEST < "$BASE/ultima-solicitacao.txt"\n        if [[ " ${REQUEST[*]} " == *" 5 "* ]]; then\n            echo "ERRO: resume nao repete backup; execute explicitamente a tarefa 5."\n            exit 2\n        fi\n        ;;',1)
dest.write_text(s)
PY
bash -n "$TMP" || { echo 'ERRO: sintaxe da atualizacao invalida; original preservado'; exit 1; }
CATALOG="$(bash "$TMP" list)" || { echo 'ERRO: catalogo da atualizacao falhou; original preservado'; exit 1; }
[[ "$CATALOG" == *'5 | Criar e validar backup PostgreSQL'* ]] || { echo 'ERRO: funcao 5 nao apareceu no catalogo; original preservado'; exit 1; }
PREVIOUS="${TARGET}.pre-funcao5-$(date +%Y%m%d-%H%M%S)-$$.bak"
cp -p "$TARGET" "$PREVIOUS"
chmod --reference="$TARGET" "$TMP"
mv -f "$TMP" "$TARGET"
echo "OK: funcao 5 instalada. Copia anterior: $PREVIOUS"
printf '%s\n' "$CATALOG"
echo 'IMPORTANTE: backup PostgreSQL NAO foi executado na instalacao.'
REMOTE_SCRIPT
