#!/usr/bin/env bash
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

task_1(){
  [[ "$(id -un)" == ubuntu ]] || { fail 1 "usuário inesperado: $(id -un)"; return 1; }
  [[ "$(hostname -s)" == intent-app-01 ]] || { fail 1 "host inesperado: $(hostname -s)"; return 1; }
  for c in bash git python3 docker curl df flock pg_restore sha256sum tee; do command -v "$c" >/dev/null || { fail 1 "comando ausente: $c"; return 1; }; done
  [[ -d /opt/intent && -d "$REPO" ]] || { fail 1 'paths oficiais ausentes'; return 1; }
  ok 1 'ambiente VM validado'
}



task_4(){
  df -h "$REPO" "$BASE" || return 1
  free -h || return 1
  ok 4 "recursos consultados"
}

task_6(){
  local before after
  task_4 || return 1
  [[ -f "$POSTGRES_BACKUP_SCRIPT" ]] || { fail 6 'rotina externa ausente'; return 1; }
  bash -n "$POSTGRES_BACKUP_SCRIPT" || return 1
  before="$(backup_inventory "$POSTGRES_BACKUP_DIR" '*.dump')" || return 1
  sudo -n bash "$POSTGRES_BACKUP_SCRIPT" || { fail 6 'rotina externa falhou'; return 1; }
  after="$(backup_inventory "$POSTGRES_BACKUP_DIR" '*.dump')" || return 1
  local -a created=()
  mapfile -d '' -t created < <(new_backup_paths "$before" "$after")
  [[ "${#created[@]}" -eq 1 ]] || { fail 6 'esperado exatamente um dump novo'; return 1; }
  valid_pg_backup "${created[0]}" || { fail 6 'dump novo inválido'; return 1; }
  ok 6 "dump novo validado: ${created[0]}; restauração não ensaiada"
}

task_7(){
  need_repo || { fail 7 'repo inválido'; return 1; }
  [[ -z "$(git -C "$REPO" status --porcelain)" ]] || { fail 7 'árvore suja; sincronização bloqueada'; return 1; }
  branch="$(git -C "$REPO" branch --show-current || true)"
  git -C "$REPO" fetch origin --no-tags --prune || { fail 7 'fetch falhou'; return 1; }
  if [[ -n "$branch" ]]; then
    git -C "$REPO" pull --ff-only origin "$branch" || { fail 7 "pull --ff-only falhou para $branch"; return 1; }
  else
    echo 'HEAD destacado; apenas fetch executado.'
  fi
  git -C "$REPO" log --oneline -5
  ok 7 'código da VM sincronizado/fetch validado'
}

task_8(){
  application_health || { fail 8 "consulta de saúde falhou"; return 1; }
  ok 8 "endpoints consultados; homologação e isolamento de portas exigem verificação própria"
}


task_10(){ na 10 'preparar release pertence ao PC'; }

task_11(){
  need_repo || return 1
  require_approved_revision || return 1
  [[ -n "${INTENT_RELEASE_TAG:-}" ]] || return 1
  git -C "$REPO" check-ref-format "refs/tags/$INTENT_RELEASE_TAG" || return 1
  git -C "$REPO" fetch --tags --quiet origin || return 1
  [[ "$(git -C "$REPO" rev-parse "refs/tags/$INTENT_RELEASE_TAG^{commit}")" == "$INTENT_EXPECTED_COMMIT" ]] || return 1
  ok 11 'tag aponta para revisão aprovada; release API não consultada'
}

task_12(){
  [[ "${INTENT_AUTORIZO_DEPLOY:-}" == SIM ]] || { fail 12 'INTENT_AUTORIZO_DEPLOY=SIM obrigatório'; return 1; }
  require_approved_revision || return 1
  task_2 || return 1
  git -C "$REPO" fetch origin --no-tags --prune || return 1
  [[ "$(git -C "$REPO" rev-parse origin/main)" == "$INTENT_EXPECTED_COMMIT" ]] || return 1
  local component="${INTENT_DEPLOY_COMPONENT:-}" target
  case "$component" in api|frontend|all) ;; *) fail 12 'componente api/frontend/all obrigatório'; return 1;; esac
  # Backend faz seu backup dentro da janela; frontend não altera banco.
  for target in api frontend; do
    [[ "$component" == all || "$component" == "$target" ]] || continue
    sudo -n env INTENT_EXPECTED_COMMIT="$INTENT_EXPECTED_COMMIT" INTENT_AUTORIZO_DEPLOY=SIM bash "$SCRIPT_ROOT/acoes/deploy-$target.sh" || return 1
  done
  ok 12 'componentes solicitados concluídos; all não é transação atômica'
}

task_13(){
  application_health || { fail 13 "consulta de saúde falhou"; return 1; }
  ok 13 "endpoints consultados; homologação e isolamento de portas exigem verificação própria"
}

task_14(){
  need_repo || return 1
  git -C "$REPO" rev-parse HEAD || return 1
  git -C "$REPO" status --short || return 1
  git -C "$REPO" describe --tags --exact-match 2>/dev/null || echo 'Sem tag exata'
  [[ "$ENVIRONMENT" != vm ]] || docker ps --format 'table {{.Names}}\t{{.Status}}' || return 1
  ok 14 'relatório emitido; sem inferir CI, deploy ou homologação'
}

task_15(){
  echo 'Rollback controlado ainda depende do procedimento validado do deploy backend.'
  echo 'Use somente se houver autorização explícita e relatório de falha.'
  na 15 'rollback não automatizado neste executor inicial'
}


task_5(){
  local file
  file="$(latest_pg_backup)" || return 1
  valid_pg_backup "$file" || { fail 5 'dump inválido/ausente'; return 1; }
  ok 5 "backup verificado: $file; restauração não ensaiada"
}
