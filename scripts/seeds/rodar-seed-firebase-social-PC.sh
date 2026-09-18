#!/usr/bin/env bash
set -Eeuo pipefail

VERSION="intent-firebase-social-runner-PC-2026.09.18.02"
OWNER_REPO="edinhogrubert/Intent"
REF="${INTENT_SEED_REF:-main}"
REPO="/home/grubert/Projetos/Intent-local"
BACKEND="$REPO/backend"
EXECUTOR_PC="/home/grubert/intent-automacao/intent-executor-PC.sh"

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

section "Intent — seed Firebase social PC"

echo "VERSAO_RUNNER=$VERSION"
echo "OWNER_REPO=$OWNER_REPO"
echo "REF=$REF"
echo "REPO=$REPO"
echo "BACKEND=$BACKEND"
echo "MODO=${INTENT_SEED_DRY_RUN:-SIM}"
echo "MANIFESTO=${INTENT_FIREBASE_SOCIAL_USERS_FILE:-inline-ou-default}"
echo "Usuário: $(id -un)"
echo "Host: $(hostname -s)"

[[ "$(id -un)" == "grubert" ]] || fail "este runner deve rodar como usuário grubert"
[[ "$(hostname -s)" == "lubuntu" ]] || fail "este runner deve rodar no PC lubuntu"
[[ -d "$REPO/.git" ]] || fail "repositório local não encontrado: $REPO"
[[ -d "$BACKEND" ]] || fail "backend não encontrado: $BACKEND"
[[ -x "$EXECUTOR_PC" || -f "$EXECUTOR_PC" ]] || fail "executor PC não encontrado: $EXECUTOR_PC"

section "Sincronizando repositório local com ${REF}"

git -C "$REPO" fetch origin --prune

if [[ -n "$(git -C "$REPO" status --porcelain)" ]]; then
  git -C "$REPO" status --short
  fail "árvore local suja antes da troca de referência; seed bloqueado"
fi

git -C "$REPO" checkout "$REF"
git -C "$REPO" pull --ff-only origin "$REF"

echo "HEAD_LOCAL=$(git -C "$REPO" rev-parse HEAD)"
echo "BRANCH_LOCAL=$(git -C "$REPO" branch --show-current || true)"

if [[ -n "$(git -C "$REPO" status --porcelain)" ]]; then
  git -C "$REPO" status --short
  fail "árvore local suja; seed bloqueado"
fi

section "Validando backup Git existente"

bash "$EXECUTOR_PC" 5 || fail "backup Git local inválido; seed bloqueado"

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
