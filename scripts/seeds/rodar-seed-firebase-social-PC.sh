#!/usr/bin/env bash
set -Eeuo pipefail

VERSION="intent-firebase-social-runner-PC-2026.09.18.03"
OWNER_REPO="edinhogrubert/Intent"
REF="${INTENT_SEED_REF:-main}"
REPO="/home/grubert/Projetos/Intent-local"
BACKEND="$REPO/backend"
EXECUTOR_PC="/home/grubert/intent-automacao/intent-executor-PC.sh"
RESTORE_REF="${INTENT_SEED_RESTORE_REF:-SIM}"

section() {
  echo
  echo "================================================================"
  echo "$1"
  echo "================================================================"
}

fail() {
  echo "ERRO: $1"
  exit 1
}

ORIGINAL_BRANCH=""
ORIGINAL_HEAD=""

restore_original_ref() {
  if [[ "$RESTORE_REF" != "SIM" ]]; then
    return 0
  fi

  if [[ -z "$ORIGINAL_HEAD" ]]; then
    return 0
  fi

  echo
  echo "================================================================"
  echo "Restaurando referência local original"
  echo "================================================================"

  if [[ -n "$ORIGINAL_BRANCH" ]]; then
    git -C "$REPO" checkout "$ORIGINAL_BRANCH" >/dev/null 2>&1 || true
  else
    git -C "$REPO" checkout "$ORIGINAL_HEAD" >/dev/null 2>&1 || true
  fi

  echo "REF_RESTAURADA=$(git -C "$REPO" rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
  echo "HEAD_RESTAURADO=$(git -C "$REPO" rev-parse HEAD 2>/dev/null || true)"
}

trap restore_original_ref EXIT

section "Intent — seed Firebase social PC"

echo "VERSAO_RUNNER=$VERSION"
echo "OWNER_REPO=$OWNER_REPO"
echo "REF=$REF"
echo "REPO=$REPO"
echo "BACKEND=$BACKEND"
echo "MODO=${INTENT_SEED_DRY_RUN:-SIM}"
echo "MANIFESTO=${INTENT_FIREBASE_SOCIAL_USERS_FILE:-inline-ou-default}"
echo "RESTORE_REF=$RESTORE_REF"
echo "Usuário: $(id -un)"
echo "Host: $(hostname -s)"

[[ "$(id -un)" == "grubert" ]] || fail "este runner deve rodar como usuário grubert"
[[ "$(hostname -s)" == "lubuntu" ]] || fail "este runner deve rodar no PC lubuntu"
[[ -d "$REPO/.git" ]] || fail "repositório local não encontrado: $REPO"
[[ -d "$BACKEND" ]] || fail "backend não encontrado: $BACKEND"
[[ -x "$EXECUTOR_PC" || -f "$EXECUTOR_PC" ]] || fail "executor PC não encontrado: $EXECUTOR_PC"

ORIGINAL_BRANCH="$(git -C "$REPO" rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
ORIGINAL_HEAD="$(git -C "$REPO" rev-parse HEAD 2>/dev/null || true)"
echo "ORIGINAL_BRANCH=$ORIGINAL_BRANCH"
echo "ORIGINAL_HEAD=$ORIGINAL_HEAD"

section "Sincronizando repositório local com ${REF}"

git -C "$REPO" fetch origin --prune

if [[ -n "$(git -C "$REPO" status --porcelain)" ]]; then
  git -C "$REPO" status --short
  fail "árvore local suja antes da troca de referência; seed bloqueado"
fi

if git -C "$REPO" show-ref --verify --quiet "refs/heads/$REF"; then
  git -C "$REPO" checkout "$REF"
elif git -C "$REPO" show-ref --verify --quiet "refs/remotes/origin/$REF"; then
  git -C "$REPO" checkout -B "$REF" "origin/$REF"
else
  git -C "$REPO" checkout "$REF"
fi

if git -C "$REPO" show-ref --verify --quiet "refs/remotes/origin/$REF"; then
  git -C "$REPO" pull --ff-only origin "$REF"
fi

echo "HEAD_LOCAL=$(git -C "$REPO" rev-parse HEAD)"
echo "BRANCH_LOCAL=$(git -C "$REPO" branch --show-current || true)"

if [[ -n "$(git -C "$REPO" status --porcelain)" ]]; then
  git -C "$REPO" status --short
  fail "árvore local suja; seed bloqueado"
fi

section "Validando backup Git existente"

backup_log="$(mktemp)"
set +e
bash "$EXECUTOR_PC" 5 >"$backup_log" 2>&1
backup_status=$?
set -e
cat "$backup_log"

if grep -q "OK 5: backup Git válido" "$backup_log"; then
  echo "BACKUP_VALIDADO=SIM"
else
  echo "BACKUP_EXIT_CODE=$backup_status"
  rm -f "$backup_log"
  fail "backup Git local não validado pelo relatório; seed bloqueado"
fi
rm -f "$backup_log"

section "Preparando backend"

cd "$BACKEND"

if [[ ! -d node_modules ]]; then
  echo "node_modules ausente; executando npm ci"
  npm ci
fi

npm run prisma:generate

section "Executando seed Firebase social"

if [[ "${INTENT_SEED_DRY_RUN:-SIM}" != "NAO" ]]; then
  echo "DRY RUN: nenhuma escrita será feita."
  INTENT_SEED_DRY_RUN=SIM npm run seed:firebase-social
else
  [[ "${INTENT_ALLOW_FIREBASE_SOCIAL_SEED:-}" == "SIM" ]] || fail "para gravar, use INTENT_ALLOW_FIREBASE_SOCIAL_SEED=SIM INTENT_SEED_DRY_RUN=NAO"
  INTENT_ALLOW_FIREBASE_SOCIAL_SEED=SIM INTENT_SEED_DRY_RUN=NAO npm run seed:firebase-social
fi

section "Resumo"

echo "RUNNER_OK=$VERSION"
echo "REF=$REF"
echo "HEAD=$(git -C "$REPO" rev-parse HEAD)"
echo "MODO_FINAL=${INTENT_SEED_DRY_RUN:-SIM}"
