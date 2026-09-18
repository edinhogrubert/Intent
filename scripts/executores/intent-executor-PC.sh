#!/usr/bin/env bash
set -Eeuo pipefail

BASE=/home/grubert/intent-automacao
REPO=/home/grubert/Projetos/Intent-local
BACKUP_SCRIPT="$BASE/intent-backup-git-PC.sh"
RETOMADA_SCRIPT="$BASE/intent-retomada-PC.sh"
LOCK="$BASE/executor-PC.lock"
IDS=(1 2 3 4 5 6 7 8 9 10 11 12 13 14 15)
declare -A STATUS DETAIL

mkdir -p "$BASE/relatorios"
exec 9>"$LOCK"
flock -n 9 || { echo 'ERRO: outro executor PC em andamento'; exit 1; }

ok(){ [[ "${STATUS[$1]:-}" == ERRO ]] && return 1; STATUS[$1]=OK; DETAIL[$1]="$2"; echo "OK $1: $2"; }
na(){ [[ "${STATUS[$1]:-}" == ERRO ]] && return 1; STATUS[$1]=NA; DETAIL[$1]="$2"; echo "N/A $1: $2"; }
fail(){ STATUS[$1]=ERRO; DETAIL[$1]="$2"; echo "ERRO $1: $2"; return 1; }
need_repo(){ [[ -d "$REPO/.git" ]] || { echo "Repo ausente: $REPO"; return 1; }; }

list(){ cat <<'TXT'
1) Validar ambiente
2) Inspecionar repositório Git
3) Verificar release/tag atual
4) Verificar recursos do ambiente
5) Validar backup Git bundle existente
6) Criar e validar backup Git
7) Sincronizar código com origem oficial
8) Rodar validações/testes locais
9) Atualizar/validar continuidade
10) Preparar release
11) Criar/validar tag ou release
12) N/A no PC — deploy controlado pertence à VM
13) N/A no PC — validação de aplicação em execução pertence à VM
14) Relatório final de fechamento local
15) N/A no PC — rollback controlado pertence à VM
TXT
}

has_npm_script(){
  local dir="$1" name="$2"
  [[ -f "$dir/package.json" ]] || return 1
  node -e 'const fs=require("fs");const p=process.argv[1],n=process.argv[2];const j=JSON.parse(fs.readFileSync(p));process.exit(j.scripts&&j.scripts[n]?0:1)' "$dir/package.json" "$name" >/dev/null 2>&1
}

latest_bundle(){ find "$BASE" "$REPO" -maxdepth 6 -type f -name '*.bundle' 2>/dev/null | xargs -r ls -1t 2>/dev/null | head -n 1; }
valid_bundle(){ local b="$1"; [[ -n "$b" && -s "$b" ]] || return 1; git -C "$REPO" bundle verify "$b" >/dev/null; }

task_1(){
  [[ "$(id -un)" == grubert ]] || { fail 1 "usuário inesperado: $(id -un)"; return 1; }
  [[ "$(hostname -s)" == lubuntu ]] || { fail 1 "host inesperado: $(hostname -s)"; return 1; }
  for c in bash git find df flock; do command -v "$c" >/dev/null || { fail 1 "comando ausente: $c"; return 1; }; done
  [[ -d "$BASE" && -d "$REPO" ]] || { fail 1 'paths base/repo ausentes'; return 1; }
  ok 1 'ambiente PC validado'
}

task_2(){
  need_repo || { fail 2 'repo inválido'; return 1; }
  echo "branch: $(git -C "$REPO" branch --show-current || true)"
  echo "head: $(git -C "$REPO" rev-parse --short HEAD)"
  echo "origin: $(git -C "$REPO" remote get-url origin 2>/dev/null || echo ausente)"
  if [[ -n "$(git -C "$REPO" status --porcelain)" ]]; then git -C "$REPO" status --short; fail 2 'árvore suja'; return 1; fi
  ok 2 'git limpo e inspecionado'
}

task_3(){
  need_repo || { fail 3 'repo inválido'; return 1; }
  git -C "$REPO" fetch --tags --quiet origin || { fail 3 'fetch tags falhou'; return 1; }
  echo "tag-no-head: $(git -C "$REPO" describe --tags --exact-match 2>/dev/null || echo nenhuma)"
  git -C "$REPO" tag --list 'mvp-*' --sort=-version:refname | head -n 10 || true
  ok 3 'release/tag verificada'
}

task_4(){ df -h "$REPO" "$BASE"; ok 4 'recursos locais verificados'; }

task_5(){
  need_repo || { fail 5 'repo inválido'; return 1; }
  local b; b="$(latest_bundle || true)"
  valid_bundle "$b" || { fail 5 "backup Git inválido/ausente: ${b:-nenhum}"; return 1; }
  ok 5 "backup Git válido: $b"
}

task_6(){
  task_4 || { fail 6 'verificação de recursos falhou'; return 1; }
  [[ -f "$BACKUP_SCRIPT" ]] || { fail 6 "script auxiliar ausente: $BACKUP_SCRIPT"; return 1; }
  bash -n "$BACKUP_SCRIPT" || { fail 6 'sintaxe inválida no backup Git'; return 1; }
  bash "$BACKUP_SCRIPT" || { fail 6 'backup Git falhou'; return 1; }
  local b; b="$(latest_bundle || true)"
  valid_bundle "$b" || { fail 6 "bundle gerado inválido: ${b:-nenhum}"; return 1; }
  ok 6 "backup Git criado/validado: $b"
}

task_7(){
  need_repo || { fail 7 'repo inválido'; return 1; }
  [[ -z "$(git -C "$REPO" status --porcelain)" ]] || { fail 7 'árvore suja; sincronização bloqueada'; return 1; }
  git -C "$REPO" fetch origin --prune || { fail 7 'fetch falhou'; return 1; }
  git -C "$REPO" checkout main || { fail 7 'checkout main falhou'; return 1; }
  git -C "$REPO" pull --ff-only origin main || { fail 7 'pull --ff-only falhou'; return 1; }
  git -C "$REPO" log --oneline -5
  ok 7 'main local sincronizada'
}

task_8(){
  need_repo || { fail 8 'repo inválido'; return 1; }
  git -C "$REPO" diff --check || { fail 8 'git diff --check falhou'; return 1; }
  if has_npm_script "$REPO" lint; then (cd "$REPO" && npm run lint) || { fail 8 'lint falhou'; return 1; }; fi
  if has_npm_script "$REPO" build; then (cd "$REPO" && npm run build) || { fail 8 'build frontend falhou'; return 1; }; fi
  if [[ -d "$REPO/backend" ]]; then
    if has_npm_script "$REPO/backend" test; then (cd "$REPO/backend" && npm test) || { fail 8 'testes backend falharam'; return 1; }; fi
    if has_npm_script "$REPO/backend" build; then (cd "$REPO/backend" && npm run build) || { fail 8 'build backend falhou'; return 1; }; fi
  fi
  ok 8 'validações locais concluídas'
}

task_9(){
  need_repo || { fail 9 'repo inválido'; return 1; }
  local files=(contratos/README.md contratos/INTERFACE_EXECUTORES.md contratos/ARQUITETURA_ATUAL_VM.md docs/ai-handoff/continuidade/ESTADO_ATUAL_INTENT.md docs/ai-handoff/continuidade/PROMPT_RETOMADA_CHATGPT.md)
  local miss=0; for f in "${files[@]}"; do [[ -f "$REPO/$f" ]] || { echo "ausente: $f"; miss=1; }; done
  [[ $miss -eq 0 ]] || { fail 9 'continuidade incompleta'; return 1; }
  ok 9 'continuidade validada'
}

task_10(){ task_2 && task_3 && task_5 && task_9 && ok 10 'release preparada; função 11 exige autorização'; }

task_11(){
  need_repo || { fail 11 'repo inválido'; return 1; }
  [[ -n "${INTENT_RELEASE_TAG:-}" ]] || { fail 11 'INTENT_RELEASE_TAG não definido'; return 1; }
  [[ "${INTENT_AUTORIZO_RELEASE:-}" == SIM ]] || { fail 11 'INTENT_AUTORIZO_RELEASE=SIM ausente'; return 1; }
  task_10 || { fail 11 'preparação de release falhou'; return 1; }
  git -C "$REPO" tag -a "$INTENT_RELEASE_TAG" -m "Intent $INTENT_RELEASE_TAG" || { fail 11 'criação da tag falhou'; return 1; }
  git -C "$REPO" push origin "$INTENT_RELEASE_TAG" || { fail 11 'push da tag falhou'; return 1; }
  ok 11 "tag enviada: $INTENT_RELEASE_TAG"
}

task_12(){ na 12 'deploy controlado não se aplica ao PC'; }
task_13(){ na 13 'validação de aplicação em execução não se aplica ao PC'; }

task_14(){
  need_repo || { fail 14 'repo inválido'; return 1; }
  echo "HEAD: $(git -C "$REPO" rev-parse --short HEAD)"
  git -C "$REPO" status --short || true
  if [[ -f "$RETOMADA_SCRIPT" ]]; then bash -n "$RETOMADA_SCRIPT" && bash "$RETOMADA_SCRIPT"; else echo "N/A retomada: $RETOMADA_SCRIPT ausente"; fi
  ok 14 'relatório final local emitido'
}

task_15(){ na 15 'rollback controlado não se aplica ao PC'; }

run(){ case "$1" in 1)task_1;;2)task_2;;3)task_3;;4)task_4;;5)task_5;;6)task_6;;7)task_7;;8)task_8;;9)task_9;;10)task_10;;11)task_11;;12)task_12;;13)task_13;;14)task_14;;15)task_15;;*) echo "função desconhecida: $1"; return 1;; esac; }
summary(){ echo '==== RESUMO PC ===='; for i in "${IDS[@]}"; do [[ -n "${STATUS[$i]:-}" ]] && printf '%2s %-4s %s\n' "$i" "${STATUS[$i]}" "${DETAIL[$i]}"; done; }

[[ "${1:-}" == list ]] && { list; exit 0; }
[[ $# -gt 0 ]] || { list; exit 1; }
rc=0; for id in "$@"; do run "$id" || { rc=1; break; }; done
summary
exit "$rc"
