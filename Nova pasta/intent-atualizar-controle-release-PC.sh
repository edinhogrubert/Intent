#!/usr/bin/env bash
set -Eeuo pipefail
PC_BASE=/home/grubert/intent-automacao
PC_EXEC="$PC_BASE/intent-executor-PC.sh"
PC_MANIFEST="$PC_BASE/release-aprovada.env"
VM=ubuntu@157.151.255.227
KEY="$HOME/.ssh/id_ed25519"
RELEASE=mvp-1.0.23
COMMIT=4cbdc3ad5b3b6e5e699123f7e0389f98c4f4da6f
[[ "$(id -un)" == grubert && "$(hostname -s)" == lubuntu ]] || { echo 'ERRO: execute no PC lubuntu como grubert'; exit 1; }
[[ -r "$KEY" && -f "$PC_EXEC" ]] || { echo 'ERRO: chave SSH ou executor PC ausente'; exit 1; }
exec 9>"$PC_BASE/instalador-release.lock"
flock -n 9 || { echo 'ERRO: outro instalador em execucao'; exit 1; }
bash -n "$PC_EXEC"
[[ "$(git -C /home/grubert/Projetos/Intent-local rev-parse HEAD)" == "$COMMIT" ]] || { echo 'ERRO: commit PC diferente; nao instalar'; exit 1; }
[[ "$(git -C /home/grubert/Projetos/Intent-local rev-parse "refs/tags/$RELEASE^{commit}")" == "$COMMIT" ]] || { echo 'ERRO: tag PC nao confere'; exit 1; }
SSH=(ssh -i "$KEY" -o IdentitiesOnly=yes -o BatchMode=yes -o ConnectTimeout=12 "$VM")
# Validate remote environment and current release BEFORE touching either executor.
"${SSH[@]}" "test \"\$(id -un)\" = ubuntu && test \"\$(hostname -s)\" = intent-app-01 && test -f /home/ubuntu/intent-executor-VM.sh && test \"\$(git -C /opt/intent/source rev-parse HEAD)\" = '$COMMIT' && test \"\$(git -C /opt/intent/source rev-parse 'refs/tags/$RELEASE^{commit}')\" = '$COMMIT' && bash -n /home/ubuntu/intent-executor-VM.sh" || { echo 'ERRO: pre-validacao VM falhou; nenhuma alteracao aplicada'; exit 1; }
TMP_PC=$(mktemp "$PC_BASE/.release-pc.XXXXXXXX")
trap 'rm -f "$TMP_PC"' EXIT
python3 - "$PC_EXEC" "$TMP_PC" <<'PY'
from pathlib import Path
import sys
s=Path(sys.argv[1]).read_text()
if 'release-aprovada.env' in s:
    raise SystemExit('ERRO: executor PC ja usa manifesto; revisar antes de reaplicar')
a=s.index('task_3() {'); b=s.index('task_4() {',a)
s=s[:a]+'''task_3() {
    local manifest="/home/grubert/intent-automacao/release-aprovada.env"
    local release commit actual tag changes
    [[ -r "$manifest" ]] || { DETAIL[3]="Manifesto de release ausente"; return 1; }
    release="$(sed -n 's/^RELEASE=//p' "$manifest")"
    commit="$(sed -n 's/^COMMIT=//p' "$manifest")"
    [[ "$release" =~ ^mvp-[0-9]+\\.[0-9]+\\.[0-9]+$ && "$commit" =~ ^[0-9a-f]{40}$ ]] || {
        DETAIL[3]="Manifesto invalido"; return 1;
    }
    actual="$(git -C "$REPO" rev-parse HEAD 2>/dev/null)" || { DETAIL[3]="HEAD indisponivel"; return 1; }
    tag="$(git -C "$REPO" rev-parse "refs/tags/$release^{commit}" 2>/dev/null)" || {
        DETAIL[3]="Tag aprovada nao encontrada"; return 1;
    }
    changes="$(git -C "$REPO" status --porcelain 2>/dev/null)" || { DETAIL[3]="Git status falhou"; return 1; }
    [[ "$actual" == "$commit" && "$tag" == "$commit" && -z "$changes" ]] || {
        DETAIL[3]="HEAD, tag ou limpeza nao correspondem a release aprovada"; return 1;
    }
    DETAIL[3]="Release aprovada $release; commit ${commit:0:12}; repositorio limpo"
}

'''+s[b:]
# Backup Git standalone remains pinned: never run it after manifest changes until separately updated.
a=s.index('task_6() {'); b=s.index('run_task() {',a)
block=s[a:b]
needle='    local script="/home/grubert/intent-automacao/intent-backup-git-PC.sh"'
if block.count(needle)!=1: raise SystemExit('ERRO: tarefa 6 PC inesperada; nada instalado')
block=block.replace(needle,needle+'''
    local release commit
    release="$(sed -n 's/^RELEASE=//p' /home/grubert/intent-automacao/release-aprovada.env)"
    commit="$(sed -n 's/^COMMIT=//p' /home/grubert/intent-automacao/release-aprovada.env)"
    if [[ "$release" != "mvp-1.0.23" || "$commit" != "4cbdc3ad5b3b6e5e699123f7e0389f98c4f4da6f" ]]; then
        DETAIL[6]="Backup Git independente ainda fixado em mvp-1.0.23; atualizar rotina antes de nova release"
        return 1
    fi''',1)
s=s[:a]+block+s[b:]
Path(sys.argv[2]).write_text(s)
PY
bash -n "$TMP_PC"
# Stage and validate VM code without modifying the original.
echo 'Preparando e validando atualizacao na VM...'
"${SSH[@]}" 'bash -s' <<'REMOTE'
set -Eeuo pipefail
TARGET=/home/ubuntu/intent-executor-VM.sh
TMP=/home/ubuntu/.intent-release-stage.sh
trap 'rm -f "$TMP"' ERR
python3 - "$TARGET" "$TMP" <<'PY'
from pathlib import Path
import sys
s=Path(sys.argv[1]).read_text()
if 'release-aprovada.env' in s: raise SystemExit('ERRO: VM ja usa manifesto; revisar antes de reaplicar')
a=s.index('task_2() {'); b=s.index('task_3() {',a)
s=s[:a]+'''task_2() {
    local manifest="/home/ubuntu/intent-executor/release-aprovada.env"
    local release commit actual tag changes
    [[ -r "$manifest" ]] || { DETAILS[2]="Manifesto de release ausente"; return 1; }
    release="$(sed -n 's/^RELEASE=//p' "$manifest")"
    commit="$(sed -n 's/^COMMIT=//p' "$manifest")"
    [[ "$release" =~ ^mvp-[0-9]+\\.[0-9]+\\.[0-9]+$ && "$commit" =~ ^[0-9a-f]{40}$ ]] || {
        DETAILS[2]="Manifesto invalido"; return 1;
    }
    actual="$(git -C "$REPO" rev-parse HEAD 2>/dev/null)" || { DETAILS[2]="HEAD indisponivel"; return 1; }
    tag="$(git -C "$REPO" rev-parse "refs/tags/$release^{commit}" 2>/dev/null)" || {
        DETAILS[2]="Tag aprovada ausente"; return 1;
    }
    changes="$(git -C "$REPO" status --porcelain 2>/dev/null)" || { DETAILS[2]="Git status falhou"; return 1; }
    [[ "$actual" == "$commit" && "$tag" == "$commit" && -z "$changes" ]] || {
        DETAILS[2]="HEAD, tag ou limpeza nao correspondem a release aprovada"; return 1;
    }
    DETAILS[2]="Release aprovada $release; commit ${commit:0:12}; repositorio limpo"
}

'''+s[b:]
# Keep legacy RELEASE/COMMIT for report and compatibility, but source them from validated manifest.
anchor='COMMIT="4cbdc3ad5b3b6e5e699123f7e0389f98c4f4da6f"'
if s.count(anchor)!=1: raise SystemExit('ERRO: cabecalho VM inesperado')
s=s.replace(anchor,'''COMMIT="4cbdc3ad5b3b6e5e699123f7e0389f98c4f4da6f"
# Manifesto de release aprovado; dados nao sao executados como codigo shell.
MANIFEST="/home/ubuntu/intent-executor/release-aprovada.env"
if [[ -r "$MANIFEST" ]]; then
    RELEASE="$(sed -n 's/^RELEASE=//p' "$MANIFEST")"
    COMMIT="$(sed -n 's/^COMMIT=//p' "$MANIFEST")"
fi''',1)
Path(sys.argv[2]).write_text(s)
PY
bash -n "$TMP"
REMOTE
# Install VM first; PC installation follows only after remote succeeds.
echo 'Instalando manifesto e executor na VM...'
"${SSH[@]}" 'bash -s' <<'REMOTE'
set -Eeuo pipefail
TARGET=/home/ubuntu/intent-executor-VM.sh
BASE=/home/ubuntu/intent-executor
TMP=/home/ubuntu/.intent-release-stage.sh
[[ -f "$TMP" ]] && bash -n "$TMP" || { echo 'ERRO: stage remoto ausente'; exit 1; }
STAMP="$(date +%Y%m%d-%H%M%S)-$$"
cp -p "$TARGET" "$TARGET.pre-release-$STAMP.bak"
if [[ -e "$BASE/release-aprovada.env" ]]; then cp -p "$BASE/release-aprovada.env" "$BASE/release-aprovada.env.pre-$STAMP.bak"; fi
printf 'RELEASE=mvp-1.0.23\nCOMMIT=4cbdc3ad5b3b6e5e699123f7e0389f98c4f4da6f\n' > "$BASE/.release-aprovada.tmp"
chmod 600 "$BASE/.release-aprovada.tmp"
mv "$BASE/.release-aprovada.tmp" "$BASE/release-aprovada.env"
chmod --reference="$TARGET" "$TMP"
mv "$TMP" "$TARGET"
bash "$TARGET" 2 >/dev/null || { echo 'ERRO: validacao da release VM falhou; consulte backup do executor'; exit 1; }
echo "OK: VM atualizada e release verificada. Copia: $TARGET.pre-release-$STAMP.bak"
REMOTE
STAMP="$(date +%Y%m%d-%H%M%S)-$$"
cp -p "$PC_EXEC" "$PC_EXEC.pre-release-$STAMP.bak"
if [[ -e "$PC_MANIFEST" ]]; then cp -p "$PC_MANIFEST" "$PC_MANIFEST.pre-$STAMP.bak"; fi
printf 'RELEASE=%s\nCOMMIT=%s\n' "$RELEASE" "$COMMIT" > "$PC_BASE/.release-aprovada.tmp"
chmod 600 "$PC_BASE/.release-aprovada.tmp"
mv "$PC_BASE/.release-aprovada.tmp" "$PC_MANIFEST"
chmod --reference="$PC_EXEC" "$TMP_PC"
mv "$TMP_PC" "$PC_EXEC"
trap - EXIT
bash "$PC_EXEC" 3 || { echo 'ERRO: verificacao PC falhou; copia anterior preservada'; exit 1; }
echo 'OK: PC e VM usam manifesto de release aprovada. Nenhum backup ou deploy executado.'
echo 'ATENCAO: backup Git independente ainda esta fixado em mvp-1.0.23; tarefa 6 bloqueia novas releases ate atualizacao da rotina.'
