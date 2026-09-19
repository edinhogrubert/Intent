#!/usr/bin/env bash
set -Eeuo pipefail
REMOTE="ubuntu@157.151.255.227"
SSH_KEY="${HOME}/.ssh/id_ed25519"
[[ -r "$SSH_KEY" ]] || { echo "ERRO: chave SSH nao encontrada: $SSH_KEY"; exit 1; }
REMOTE_SCRIPT="/home/ubuntu/intent-executor-VM.sh"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
cat > "$TMP/install.sh" <<'REMOTE_EOF'
#!/usr/bin/env bash
set -Eeuo pipefail
TARGET=/home/ubuntu/intent-executor-VM.sh
BACKUP=/opt/intent/scripts/executar-backup-postgres.sh
[[ "$(id -un)" == ubuntu ]] || { echo 'ERRO: usuario remoto inesperado'; exit 1; }
[[ -f "$TARGET" && -f "$BACKUP" ]] || { echo 'ERRO: scripts remotos ausentes'; exit 1; }
bash -n "$TARGET" && bash -n "$BACKUP"
cp -p "$TARGET" "$TARGET.pre-funcao5-$(date +%Y%m%d-%H%M%S).bak"
python3 - "$TARGET" <<'PY'
import sys,re,pathlib
p=pathlib.Path(sys.argv[1]); s=p.read_text()
if 'task_5()' in s or re.search(r'\bIDS=\([^)]*\b5\b',s):
    raise SystemExit('ERRO: funcao 5 ja existe ou ID ocupado; nenhuma alteracao aplicada')
changes=[
 (r'IDS=\(1 2 3 4\)', 'IDS=(1 2 3 4 5)'),
 (r'(?m)^(\s*4\) echo .*?;;\s*)$',r'\1\n 5) echo "Criar e validar backup PostgreSQL" ;;'),
 (r'(?m)^(\s*4\) echo 3 ;;\s*)$',r'\1\n 5) echo 3 ;;'),
 (r'(?m)(1\|2\|3\|4\) ;;)',r'1|2|3|4|5) ;;'),
]
# Only change patterns proven unique. Avoid assuming VM executor internals.
for pat,repl in changes:
    matches=list(re.finditer(pat,s))
    if len(matches)!=1:
        raise SystemExit(f'ERRO: estrutura do executor diferente da esperada: {pat} ({len(matches)} ocorrencias). Nenhuma alteracao aplicada')
    s=re.sub(pat,repl,s,count=1)
function=r'''task_5() {
    local runner="/opt/intent/scripts/executar-backup-postgres.sh"
    local directory="/opt/intent/backups/postgres"
    local before after file checksum
    [[ -f "$runner" && -d "$directory" ]] || { DETAIL[5]="Rotina ou diretorio de backup ausente"; return 1; }
    bash -n "$runner" || { DETAIL[5]="Sintaxe invalida no backup existente"; return 1; }
    before="$(find "$directory" -maxdepth 1 -type f -name 'intent_*.dump' -printf '%f\n' | sort)"
    if ! sudo -n bash "$runner"; then DETAIL[5]="Rotina de backup retornou falha"; return 1; fi
    after="$(find "$directory" -maxdepth 1 -type f -name 'intent_*.dump' -printf '%f\n' | sort)"
    file="$(comm -13 <(printf '%s\n' "$before" | sed '/^$/d') <(printf '%s\n' "$after" | sed '/^$/d') | tail -n 1)"
    [[ -n "$file" ]] || { DETAIL[5]="Nenhum novo dump detectado; possivel backup concorrente"; return 1; }
    checksum="$directory/$file.sha256"
    [[ -s "$directory/$file" && -s "$checksum" ]] || { DETAIL[5]="Dump ou checksum ausente"; return 1; }
    (cd "$directory" && sha256sum -c "${file}.sha256") || { DETAIL[5]="Checksum invalido"; return 1; }
    DETAIL[5]="Backup validado: $file"
}
'''
if s.count('run_task() {')!=1: raise SystemExit('ERRO: run_task nao localizado; nenhuma alteracao aplicada')
s=s.replace('run_task() {',function+'\nrun_task() {',1)
p.with_suffix('.sh.new').write_text(s)
PY
NEW="${TARGET%.sh}.sh.new"
if ! bash -n "$NEW"; then rm -f "$NEW"; echo 'ERRO: sintaxe; executor original preservado'; exit 1; fi
mv "$NEW" "$TARGET"
chmod 0755 "$TARGET"
echo 'OK: instalacao validada; executor anterior preservado.'
bash "$TARGET" list
REMOTE_EOF
bash -n "$TMP/install.sh"
echo "Enviando instalador para $REMOTE ..."
ssh -i "$SSH_KEY" -o IdentitiesOnly=yes -o BatchMode=yes -o ConnectTimeout=10 "$REMOTE" 'bash -s' < "$TMP/install.sh"
