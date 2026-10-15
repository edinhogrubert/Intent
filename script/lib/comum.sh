#!/usr/bin/env bash
# Biblioteca: carregar não executa operações.
ok(){ [[ "${STATUS[$1]:-}" == ERRO ]] && return 1; STATUS[$1]=OK; DETAIL[$1]="$2"; echo "OK $1: $2"; }
na(){ [[ "${STATUS[$1]:-}" == ERRO ]] && return 1; STATUS[$1]=NA; DETAIL[$1]="$2"; echo "N/A $1: $2"; }
fail(){ STATUS[$1]=ERRO; DETAIL[$1]="$2"; echo "ERRO $1: $2"; return 1; }
need_repo(){ git -C "$REPO" rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo "Repo ausente: $REPO"; return 1; }; }


require_environment(){
  local expected_user=grubert expected_host=lubuntu
  [[ "$ENVIRONMENT" == vm ]] && { expected_user=ubuntu; expected_host=intent-app-01; }
  [[ "$(id -un)" == "$expected_user" && "$(hostname -s)" == "$expected_host" ]] || {
    echo "ERRO: ambiente esperado $expected_user@$expected_host" >&2; return 1;
  }
}
require_approved_revision(){
  [[ "${INTENT_EXPECTED_COMMIT:-}" =~ ^[0-9a-f]{40}$ ]] || { echo 'Defina INTENT_EXPECTED_COMMIT com SHA completo aprovado'; return 1; }
  [[ "$(git -C "$REPO" rev-parse HEAD)" == "$INTENT_EXPECTED_COMMIT" ]] || return 1
  local origin
  origin="$(git -C "$REPO" remote get-url origin)" || return 1
  case "$origin" in https://github.com/edinhogrubert/Intent|https://github.com/edinhogrubert/Intent.git|git@github.com:edinhogrubert/Intent.git) ;; *) echo 'Remoto não oficial'; return 1;; esac
}
