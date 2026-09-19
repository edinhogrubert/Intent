#!/usr/bin/env bash
set -Eeuo pipefail
PC=/home/grubert/intent-automacao
REPO=/home/grubert/Projetos/Intent-local
REMOTE=ubuntu@157.151.255.227
KEY=/home/grubert/.ssh/id_ed25519
VM_SCRIPT=/home/ubuntu/intent-retomada-VM.sh
[[ "$(id -un)" == grubert && "$(hostname -s)" == lubuntu ]] || { echo 'ERRO: execute no PC lubuntu como grubert'; exit 1; }
[[ -d "$REPO/.git" && -r "$KEY" && -r "$PC/release-aprovada.env" ]] || { echo 'ERRO: pre-requisitos PC ausentes'; exit 1; }
mkdir -p "$PC/retomada"
exec 9>"$PC/retomada/instalacao.lock"
flock -n 9 || { echo 'ERRO: instalacao concorrente'; exit 1; }
SSH=(ssh -i "$KEY" -o IdentitiesOnly=yes -o BatchMode=yes -o ConnectTimeout=12 "$REMOTE")
SCP=(scp -i "$KEY" -o IdentitiesOnly=yes -o BatchMode=yes -o ConnectTimeout=12)
TMP=$(mktemp -d "$PC/.retomada-instalar.XXXXXXXX")
trap 'rm -rf "$TMP"' EXIT
cat > "$TMP/intent-retomada-VM.sh" <<'VM'
#!/usr/bin/env bash
set -uo pipefail
REPO=/opt/intent/source
MANIFEST=/home/ubuntu/intent-executor/release-aprovada.env
printf '=== VM | %s ===\n' "$(date --iso-8601=seconds)"
printf 'Host: %s | Usuario: %s\n' "$(hostname -s)" "$(id -un)"
if [[ -r "$MANIFEST" ]]; then
  grep -E '^(RELEASE|COMMIT)=' "$MANIFEST" || true
else echo 'ALERTA: manifesto VM ausente'; fi
if [[ -d "$REPO/.git" ]]; then
  printf 'Branch: '; git -C "$REPO" branch --show-current
  printf 'HEAD: '; git -C "$REPO" rev-parse HEAD
  printf 'Alteracoes locais (porcelain):\n'; git -C "$REPO" status --porcelain
  printf 'Tag exata: '; git -C "$REPO" describe --tags --exact-match HEAD 2>/dev/null || echo 'SEM TAG EXATA'
else echo 'ALERTA: repositorio VM ausente'; fi
for c in intent-api intent-frontend intent-postgres intent-redis; do
  printf 'Container %s: ' "$c"
  docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$c" 2>/dev/null || echo INDISPONIVEL
done
for url in http://127.0.0.1:8080/health http://127.0.0.1:8080/health/ready http://127.0.0.1:3000/healthz; do
  printf 'Endpoint %s: ' "$url"
  curl -sS -o /dev/null --max-time 8 -w '%{http_code}\n' "$url" 2>/dev/null || echo INDISPONIVEL
done
printf 'Ultimo backup PostgreSQL (metadados):\n'
find /opt/intent/backups/postgres -maxdepth 1 -type f -name '*.dump' -printf '%T@ %f\n' 2>/dev/null | sort -nr | head -1 || true
printf '=== FIM VM ===\n'
VM
cat > "$TMP/intent-retomada-PC.sh" <<'PCSCRIPT'
#!/usr/bin/env bash
set -uo pipefail
BASE=/home/grubert/intent-automacao
REPO=/home/grubert/Projetos/Intent-local
KEY=/home/grubert/.ssh/id_ed25519
REMOTE=ubuntu@157.151.255.227
mkdir -p "$BASE/retomada/relatorios" || exit 1
exec 9>"$BASE/retomada/consulta.lock"
flock -n 9 || { echo 'ERRO: outra consulta em andamento'; exit 3; }
LOG="$BASE/retomada/relatorios/retomada-$(date +%Y%m%d-%H%M%S)-$$.txt"
exec > >(tee "$LOG") 2>&1
printf 'INTENT | RETOMADA PC + GIT + VM | %s\n' "$(date --iso-8601=seconds)"
echo '=== PC / GIT ==='
printf 'Host: %s | Usuario: %s\n' "$(hostname -s)" "$(id -un)"
if [[ -r "$BASE/release-aprovada.env" ]]; then
  grep -E '^(RELEASE|COMMIT)=' "$BASE/release-aprovada.env" || true
else echo 'ALERTA: manifesto PC ausente'; fi
if [[ -d "$REPO/.git" ]]; then
  printf 'Branch: '; git -C "$REPO" branch --show-current
  printf 'HEAD: '; git -C "$REPO" rev-parse HEAD
  printf 'Origin main local: '; git -C "$REPO" rev-parse refs/remotes/origin/main 2>/dev/null || echo INDISPONIVEL
  printf 'Alteracoes locais (porcelain):\n'; git -C "$REPO" status --porcelain
  printf 'Tag exata: '; git -C "$REPO" describe --tags --exact-match HEAD 2>/dev/null || echo 'SEM TAG EXATA'
  printf 'Remote configurado: '; git -C "$REPO" remote get-url origin 2>/dev/null || echo INDISPONIVEL
else echo 'ALERTA: repositorio PC ausente'; fi
printf '\n=== VM (SSH, somente leitura) ===\n'
if ssh -i "$KEY" -o IdentitiesOnly=yes -o BatchMode=yes -o ConnectTimeout=12 "$REMOTE" 'bash /home/ubuntu/intent-retomada-VM.sh'; then
  echo 'CONSULTA_VM=OK'
else
  echo 'CONSULTA_VM=FALHOU; estado VM nao confirmado'
fi
printf '\n=== REGISTRO DE TRABALHO ===\n'
if [[ -r "$BASE/retomada/estado-trabalho.txt" ]]; then
  cat "$BASE/retomada/estado-trabalho.txt"
else echo 'ALERTA: registro de trabalho ausente'; fi
printf '\nRELATORIO_LOCAL=%s\n' "$LOG"
PCSCRIPT
cat > "$TMP/estado-trabalho.txt" <<'STATE'
INTENT | REGISTRO DE CONTINUIDADE
Atualizado em: 2026-09-17
Origem: relatorios enviados pelo usuario nesta conversa; nao substitui verificacao automatica.
ESTADO CONFIRMADO: release aprovada mvp-1.0.23, commit 4cbdc3ad5b3b6e5e699123f7e0389f98c4f4da6f. Backup Git PC e PostgreSQL VM executados e validados. Manifestos de release instalados no PC e VM.
TRABALHO ATUAL: instalar e testar consulta integrada de retomada PC + Git local + VM.
PENDENCIA OPERACIONAL: rotina independente de backup Git ainda fixa mvp-1.0.23; tarefa 6 bloqueia outras releases.
PROXIMA ACAO AUTORIZADA: executar consulta integrada e revisar relatorio. Nenhuma nova funcionalidade do app foi selecionada nesta conversa.
REGRAS: nao inferir que origin/main local equivale ao GitHub remoto atual sem fetch; nao tratar estado de trabalho como evidencia de deploy; nao realizar commit, push, merge, backup ou deploy sem autorizacao especifica.
STATE
bash -n "$TMP/intent-retomada-VM.sh"
bash -n "$TMP/intent-retomada-PC.sh"
"${SSH[@]}" 'test "$(id -un)" = ubuntu && test "$(hostname -s)" = intent-app-01 && test -f /home/ubuntu/intent-executor-VM.sh && bash -n /home/ubuntu/intent-executor-VM.sh' || { echo 'ERRO: pre-validacao VM falhou'; exit 1; }
echo 'Enviando componente de consulta para VM...'
"${SCP[@]}" "$TMP/intent-retomada-VM.sh" "$REMOTE:/home/ubuntu/.intent-retomada-VM.stage" || exit 1
"${SSH[@]}" 'bash -n /home/ubuntu/.intent-retomada-VM.stage && if test -f /home/ubuntu/intent-retomada-VM.sh; then cp -p /home/ubuntu/intent-retomada-VM.sh "/home/ubuntu/intent-retomada-VM.sh.bak-$(date +%Y%m%d-%H%M%S)"; fi && mv /home/ubuntu/.intent-retomada-VM.stage /home/ubuntu/intent-retomada-VM.sh && chmod 700 /home/ubuntu/intent-retomada-VM.sh' || { echo 'ERRO: instalacao VM falhou'; exit 1; }
if [[ -f "$PC/intent-retomada-PC.sh" ]]; then cp -p "$PC/intent-retomada-PC.sh" "$PC/intent-retomada-PC.sh.bak-$(date +%Y%m%d-%H%M%S)"; fi
if [[ -f "$PC/retomada/estado-trabalho.txt" ]]; then
  echo 'Registro de trabalho existente preservado (nao sobrescrito).'
else install -m 600 "$TMP/estado-trabalho.txt" "$PC/retomada/estado-trabalho.txt"; fi
install -m 700 "$TMP/intent-retomada-PC.sh" "$PC/intent-retomada-PC.sh"
echo 'OK: consulta instalada em PC e VM. Git nao foi alterado.'
echo 'Executando consulta integrada (somente leitura)...'
bash "$PC/intent-retomada-PC.sh"
