#!/usr/bin/env bash
set -Eeuo pipefail

BASE=/home/ubuntu/intent-automacao
TARGET=/home/ubuntu/intent-executor-VM.sh
REPO=/opt/intent/source
POSTGRES_BACKUP_SCRIPT=/opt/intent/scripts/executar-backup-postgres.sh
POSTGRES_BACKUP_DIR=/opt/intent/backups/postgres
RETOMADA_SCRIPT=/home/ubuntu/intent-retomada-VM.sh
DEPLOY_BACKEND_SCRIPT=/opt/intent/source/deploy/oracle/08-deploy-backend.sh
VERIFICADOR_SCRIPT=/opt/intent/source/deploy/oracle/21-verificar-intent-completo.sh
LOCK="$BASE/executor-VM.lock"
IDS=(1 2 3 4 5 6 7 8 9 10 11 12 13 14 15)
declare -A STATUS DETAIL

mkdir -p "$BASE/relatorios"
exec 9>"$LOCK"
flock -n 9 || { echo 'ERRO: outro executor VM em andamento'; exit 1; }

ok(){ [[ "${STATUS[$1]:-}" == ERRO ]] && return 1; STATUS[$1]=OK; DETAIL[$1]="$2"; echo "OK $1: $2"; }
na(){ [[ "${STATUS[$1]:-}" == ERRO ]] && return 1; STATUS[$1]=NA; DETAIL[$1]="$2"; echo "N/A $1: $2"; }
fail(){ STATUS[$1]=ERRO; DETAIL[$1]="$2"; echo "ERRO $1: $2"; return 1; }
need_repo(){ [[ -d "$REPO/.git" ]] || { echo "Repo ausente: $REPO"; return 1; }; }

list(){ cat <<'TXT'
1) Validar ambiente
2) Inspecionar repositório Git
3) Verificar release/tag atual
4) Verificar recursos do ambiente
5) Validar backup PostgreSQL existente
6) Criar e validar backup PostgreSQL
7) Sincronizar código com origem oficial
8) Rodar validações/testes do ambiente
9) Validar continuidade implantada
10) N/A na VM — preparar release pertence ao PC
11) Validar tag/release existente
12) Deploy controlado
13) Validar aplicação em execução
14) Relatório final de fechamento VM
15) Rollback controlado
TXT
}

latest_pg_backup(){ ls -1t "$POSTGRES_BACKUP_DIR"/intent_*.dump 2>/dev/null | head -n 1 || true; }
valid_pg_backup(){
  local dump="$1"
  [[ -n "$dump" && -s "$dump" ]] || return 1
  [[ -f "$dump.sha256" ]] && (cd "$(dirname "$dump")" && sha256sum -c "$(basename "$dump").sha256") >/dev/null || return 1
  command -v pg_restore >/dev/null 2>&1 && pg_restore -l "$dump" >/dev/null 2>&1 || true
}

task_1(){
  [[ "$(id -un)" == ubuntu ]] || { fail 1 "usuário inesperado: $(id -un)"; return 1; }
  [[ "$(hostname -s)" == intent-app-01 ]] || { fail 1 "host inesperado: $(hostname -s)"; return 1; }
  for c in bash git docker curl df flock; do command -v "$c" >/dev/null || { fail 1 "comando ausente: $c"; return 1; }; done
  [[ -d /opt/intent && -d "$REPO" ]] || { fail 1 'paths oficiais ausentes'; return 1; }
  ok 1 'ambiente VM validado'
}

task_2(){
  need_repo || { fail 2 'repo inválido'; return 1; }
  echo "branch: $(git -C "$REPO" branch --show-current || true)"
  echo "head: $(git -C "$REPO" rev-parse --short HEAD)"
  echo "origin: $(git -C "$REPO" remote get-url origin 2>/dev/null || echo ausente)"
  if [[ -n "$(git -C "$REPO" status --porcelain)" ]]; then git -C "$REPO" status --short; fail 2 'árvore suja'; return 1; fi
  ok 2 'git da VM limpo e inspecionado'
}

task_3(){
  need_repo || { fail 3 'repo inválido'; return 1; }
  git -C "$REPO" fetch --tags --quiet origin || true
  echo "tag-no-head: $(git -C "$REPO" describe --tags --exact-match 2>/dev/null || echo nenhuma)"
  git -C "$REPO" tag --list 'mvp-*' --sort=-version:refname | head -n 10 || true
  ok 3 'release/tag da VM verificada'
}

task_4(){ df -h /opt/intent "$BASE"; free -h || true; ok 4 'recursos da VM verificados'; }

task_5(){
  local dump; dump="$(latest_pg_backup)"
  valid_pg_backup "$dump" || { fail 5 "backup PostgreSQL inválido/ausente: ${dump:-nenhum}"; return 1; }
  ok 5 "backup PostgreSQL válido: $dump"
}

task_6(){
  task_4 || { fail 6 'verificação de recursos falhou'; return 1; }
  [[ -f "$POSTGRES_BACKUP_SCRIPT" ]] || { fail 6 "script auxiliar ausente: $POSTGRES_BACKUP_SCRIPT"; return 1; }
  bash -n "$POSTGRES_BACKUP_SCRIPT" || { fail 6 'sintaxe inválida no backup PostgreSQL'; return 1; }
  before="$(latest_pg_backup)"
  sudo -n bash "$POSTGRES_BACKUP_SCRIPT" || { fail 6 'backup PostgreSQL falhou'; return 1; }
  after="$(latest_pg_backup)"
  [[ -n "$after" ]] || { fail 6 'backup PostgreSQL não gerou dump'; return 1; }
  valid_pg_backup "$after" || { fail 6 "dump gerado inválido: $after"; return 1; }
  [[ "$before" != "$after" ]] || echo 'Aviso: backup mais recente não mudou.'
  ok 6 "backup PostgreSQL criado/validado: $after"
}

task_7(){
  need_repo || { fail 7 'repo inválido'; return 1; }
  [[ -z "$(git -C "$REPO" status --porcelain)" ]] || { fail 7 'árvore suja; sincronização bloqueada'; return 1; }
  branch="$(git -C "$REPO" branch --show-current || true)"
  git -C "$REPO" fetch origin --tags --prune || { fail 7 'fetch falhou'; return 1; }
  if [[ -n "$branch" ]]; then
    git -C "$REPO" pull --ff-only origin "$branch" || { fail 7 "pull --ff-only falhou para $branch"; return 1; }
  else
    echo 'HEAD destacado; apenas fetch executado.'
  fi
  git -C "$REPO" log --oneline -5
  ok 7 'código da VM sincronizado/fetch validado'
}

task_8(){
  echo 'Containers:'
  docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' || { fail 8 'docker ps falhou'; return 1; }
  curl --fail --silent --show-error http://127.0.0.1:8080/health >/dev/null 2>&1 && echo 'health OK' || echo 'health N/A ou indisponível'
  curl --fail --silent --show-error http://127.0.0.1:8080/health/ready >/dev/null 2>&1 && echo 'ready OK' || echo 'ready N/A ou indisponível'
  ok 8 'validações/smoke da VM executadas'
}

task_9(){
  need_repo || { fail 9 'repo inválido'; return 1; }
  local files=(contratos/README.md contratos/INTERFACE_EXECUTORES.md contratos/ARQUITETURA_ATUAL_VM.md docs/ai-handoff/continuidade/ESTADO_ATUAL_INTENT.md)
  local miss=0; for f in "${files[@]}"; do [[ -f "$REPO/$f" ]] || { echo "ausente: $f"; miss=1; }; done
  [[ $miss -eq 0 ]] || { fail 9 'continuidade ausente na VM'; return 1; }
  ok 9 'continuidade presente na VM'
}

task_10(){ na 10 'preparar release pertence ao PC'; }

task_11(){
  need_repo || { fail 11 'repo inválido'; return 1; }
  [[ -n "${INTENT_RELEASE_TAG:-}" ]] || { fail 11 'INTENT_RELEASE_TAG não definido'; return 1; }
  git -C "$REPO" fetch --tags --quiet origin || { fail 11 'fetch tags falhou'; return 1; }
  git -C "$REPO" rev-parse "$INTENT_RELEASE_TAG" >/dev/null 2>&1 || { fail 11 "tag ausente: $INTENT_RELEASE_TAG"; return 1; }
  ok 11 "tag/release existe: $INTENT_RELEASE_TAG"
}

task_12(){
  task_2 || { fail 12 'git da VM não está pronto'; return 1; }
  task_6 || { fail 12 'backup PostgreSQL pré-deploy falhou'; return 1; }
  [[ -f "$DEPLOY_BACKEND_SCRIPT" ]] || { fail 12 "script de deploy ausente: $DEPLOY_BACKEND_SCRIPT"; return 1; }
  bash -n "$DEPLOY_BACKEND_SCRIPT" || { fail 12 'sintaxe inválida no deploy backend'; return 1; }
  sudo -n bash "$DEPLOY_BACKEND_SCRIPT" || { fail 12 'deploy backend falhou'; return 1; }
  ok 12 'deploy controlado executado via função'
}

task_13(){
  if [[ -f "$VERIFICADOR_SCRIPT" ]]; then
    bash -n "$VERIFICADOR_SCRIPT" || { fail 13 'sintaxe inválida no verificador operacional'; return 1; }
    sudo -n bash "$VERIFICADOR_SCRIPT" || { fail 13 'verificador operacional falhou'; return 1; }
  else
    task_8 || { fail 13 'smoke básico falhou'; return 1; }
  fi
  ok 13 'aplicação validada em execução'
}

task_14(){
  need_repo || { fail 14 'repo inválido'; return 1; }
  echo "HEAD: $(git -C "$REPO" rev-parse --short HEAD)"
  git -C "$REPO" status --short || true
  docker ps --format 'table {{.Names}}\t{{.Status}}' || true
  if [[ -f "$RETOMADA_SCRIPT" ]]; then bash -n "$RETOMADA_SCRIPT" && bash "$RETOMADA_SCRIPT"; else echo "N/A retomada: $RETOMADA_SCRIPT ausente"; fi
  ok 14 'relatório final da VM emitido'
}

task_15(){
  echo 'Rollback controlado ainda depende do procedimento validado do deploy backend.'
  echo 'Use somente se houver autorização explícita e relatório de falha.'
  na 15 'rollback não automatizado neste executor inicial'
}

run(){ case "$1" in 1)task_1;;2)task_2;;3)task_3;;4)task_4;;5)task_5;;6)task_6;;7)task_7;;8)task_8;;9)task_9;;10)task_10;;11)task_11;;12)task_12;;13)task_13;;14)task_14;;15)task_15;;*) echo "função desconhecida: $1"; return 1;; esac; }
summary(){ echo '==== RESUMO VM ===='; for i in "${IDS[@]}"; do [[ -n "${STATUS[$i]:-}" ]] && printf '%2s %-4s %s\n' "$i" "${STATUS[$i]}" "${DETAIL[$i]}"; done; }

[[ "${1:-}" == list ]] && { list; exit 0; }
[[ $# -gt 0 ]] || { list; exit 1; }
rc=0; for id in "$@"; do run "$id" || { rc=1; break; }; done
summary
exit "$rc"
