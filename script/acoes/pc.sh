#!/usr/bin/env bash
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

write_backup_metadata(){
  local bundle="$1" meta="$2" sha_file="$3"
  {
    echo "INTENT - BACKUP GIT PC"
    echo "Criado em: $(date -Iseconds)"
    echo "Repo: $REPO"
    echo "Branch: $(git -C "$REPO" branch --show-current || true)"
    echo "HEAD: $(git -C "$REPO" rev-parse HEAD)"
    echo "Tag exata: $(git -C "$REPO" describe --tags --exact-match 2>/dev/null || echo 'SEM TAG EXATA')"
    echo "Origin: $(git -C "$REPO" remote get-url origin 2>/dev/null || echo ausente)"
    echo "Bundle: $bundle"
    echo "SHA256: $(cut -d' ' -f1 "$sha_file")"
  } > "$meta"
}

task_1(){
  [[ "$(id -un)" == grubert ]] || { fail 1 "usuário inesperado: $(id -un)"; return 1; }
  [[ "$(hostname -s)" == lubuntu ]] || { fail 1 "host inesperado: $(hostname -s)"; return 1; }
  for c in bash git python3 find df flock sha256sum mktemp date tee; do command -v "$c" >/dev/null || { fail 1 "comando ausente: $c"; return 1; }; done
  [[ -d "$BASE" && -d "$REPO" ]] || { fail 1 'paths base/repo ausentes'; return 1; }
  ok 1 'ambiente PC validado'
}



task_4(){
  df -h "$REPO" "$BASE" || return 1
  ok 4 "recursos consultados"
}

task_6(){
  task_4 || { fail 6 'verificação de recursos falhou'; return 1; }
  need_repo || { fail 6 'repo inválido'; return 1; }
  [[ -z "$(git -C "$REPO" status --porcelain)" ]] || { fail 6 'árvore suja; backup bloqueado'; return 1; }

  local branch head stamp safe_branch tmp bundle sha_file meta
  branch="$(git -C "$REPO" branch --show-current || true)"
  head="$(git -C "$REPO" rev-parse --short=12 HEAD)"
  stamp="$(date +%Y%m%d-%H%M%S)"
  safe_branch="${branch:-detached}"
  safe_branch="${safe_branch//[^A-Za-z0-9._-]/_}"
  bundle="$BACKUP_DIR/intent-git-${safe_branch}-${head}-${stamp}.bundle"
  tmp="$bundle.tmp"
  sha_file="$bundle.sha256"
  meta="$bundle.txt"

  echo "INTENT - BACKUP GIT PC"
  echo "Data: $(date)"
  echo "Repo: $REPO"
  echo "Branch: ${branch:-DETACHED}"
  echo "HEAD: $(git -C "$REPO" rev-parse HEAD)"
  if [[ -f "$LEGACY_BACKUP_SCRIPT" ]]; then
    echo "Aviso: script legado encontrado, mas ignorado pela função 6: $LEGACY_BACKUP_SCRIPT"
  fi

  git -C "$REPO" bundle create "$tmp" --all || { rm -f "$tmp"; fail 6 'criação do bundle falhou'; return 1; }
  git -C "$REPO" bundle verify "$tmp" >/dev/null || { rm -f "$tmp"; fail 6 'bundle criado não passou na verificação'; return 1; }
  mv -f "$tmp" "$bundle"
  (cd "$(dirname "$bundle")" && sha256sum "$(basename "$bundle")" > "$(basename "$sha_file")") || { fail 6 'geração do checksum falhou'; return 1; }
  write_backup_metadata "$bundle" "$meta" "$sha_file"
  valid_bundle "$bundle" || { fail 6 "bundle final inválido: $bundle"; return 1; }
  ok 6 "backup Git criado/validado: $bundle"
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
  need_repo || return 1
  task_2 || return 1
  local sandbox rc=0
  sandbox="$(mktemp -d)" || return 1
  git clone --quiet --no-hardlinks "$REPO" "$sandbox/source" || { rm -rf "$sandbox"; return 1; }
  git -C "$sandbox/source" checkout --quiet --detach "$(git -C "$REPO" rev-parse HEAD)" || { rm -rf "$sandbox"; return 1; }
  bash -e -o pipefail -s -- "$sandbox/source" <<'VALIDATE' || rc=$?
    cd "$1"
    bun install --frozen-lockfile
    bun run lint
    bun run build
    cd backend
    npm ci --no-audit --no-fund
    npm run lint
    npm test
    npm run build
VALIDATE
  rm -rf "$sandbox"
  [[ "$rc" -eq 0 ]] || { fail 8 'validações em cópia descartável falharam'; return "$rc"; }
  ok 8 'lint/build/test em cópia descartável; PostgreSQL real e produção não certificados'
}


task_10(){ task_2 && task_3 && task_5 && task_9 && ok 10 'release preparada; função 11 exige autorização'; }

task_11(){
  need_repo || { fail 11 'repo inválido'; return 1; }
  [[ -n "${INTENT_RELEASE_TAG:-}" ]] || { fail 11 'INTENT_RELEASE_TAG não definido'; return 1; }
  [[ "${INTENT_AUTORIZO_RELEASE:-}" == SIM ]] || { fail 11 'INTENT_AUTORIZO_RELEASE=SIM ausente'; return 1; }
  require_approved_revision || return 1
  git -C "$REPO" check-ref-format "refs/tags/$INTENT_RELEASE_TAG" || return 1
  task_10 || { fail 11 'preparação de release falhou'; return 1; }
  git -C "$REPO" tag -a "$INTENT_RELEASE_TAG" -m "Intent $INTENT_RELEASE_TAG" || { fail 11 'criação da tag falhou'; return 1; }
  git -C "$REPO" push origin "$INTENT_RELEASE_TAG" || { fail 11 'push da tag falhou'; return 1; }
  ok 11 "tag enviada: $INTENT_RELEASE_TAG"
}

task_12(){ na 12 'deploy controlado não se aplica ao PC'; }
task_13(){ na 13 'validação de aplicação em execução não se aplica ao PC'; }

task_14(){
  need_repo || return 1
  git -C "$REPO" rev-parse HEAD || return 1
  git -C "$REPO" status --short || return 1
  git -C "$REPO" describe --tags --exact-match 2>/dev/null || echo 'Sem tag exata'
  [[ "$ENVIRONMENT" != vm ]] || docker ps --format 'table {{.Names}}\t{{.Status}}' || return 1
  ok 14 'relatório emitido; sem inferir CI, deploy ou homologação'
}

task_15(){ na 15 'rollback controlado não se aplica ao PC'; }


task_5(){
  local file
  need_repo || return 1
  file="$(latest_bundle)" || return 1
  valid_bundle "$file" || { fail 5 'bundle inválido/ausente'; return 1; }
  [[ -f "$file.sha256" ]] || { fail 5 'checksum obrigatório ausente'; return 1; }
  (cd "$(dirname "$file")" && sha256sum -c "$(basename "$file").sha256") || return 1
  ok 5 "backup verificado: $file; restauração não ensaiada"
}
