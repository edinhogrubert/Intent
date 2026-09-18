#!/usr/bin/env bash
set -Eeuo pipefail

VERSION="intent-social-demo-runner-PC-2026.09.18.02"
REPO="/home/grubert/Projetos/Intent-local"
BACKEND="$REPO/backend"
EXECUTOR_PC="/home/grubert/intent-automacao/intent-executor-PC.sh"
SEED_REF="${INTENT_SEED_REF:-main}"

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

section "Intent — seed social demo PC"

echo "VERSAO_RUNNER=$VERSION"
echo "REPO=$REPO"
echo "BACKEND=$BACKEND"
echo "REF=$SEED_REF"
echo "MODO=${INTENT_SEED_DRY_RUN:-SIM}"

echo "Usuário: $(id -un)"
echo "Host: $(hostname -s)"

[[ "$(id -un)" == "grubert" ]] || fail "este runner deve rodar como usuário grubert"
[[ "$(hostname -s)" == "lubuntu" ]] || fail "este runner deve rodar no PC lubuntu"
[[ -d "$REPO/.git" ]] || fail "repositório local não encontrado: $REPO"
[[ -d "$BACKEND" ]] || fail "backend não encontrado: $BACKEND"
[[ -x "$EXECUTOR_PC" || -f "$EXECUTOR_PC" ]] || fail "executor PC não encontrado: $EXECUTOR_PC"

section "Sincronizando ref local"

git -C "$REPO" fetch origin --prune
git -C "$REPO" checkout "$SEED_REF"
git -C "$REPO" pull --ff-only origin "$SEED_REF"

git -C "$REPO" status --short

if [[ -n "$(git -C "$REPO" status --porcelain)" ]]; then
  fail "árvore local suja; seed bloqueado"
fi

section "Validando backup Git existente"

bash "$EXECUTOR_PC" 5

section "Preparando backend"

cd "$BACKEND"

if [[ ! -d node_modules ]]; then
  echo "node_modules ausente; executando npm ci"
  npm ci
fi

npm run prisma:generate

section "Executando seed social demo"

if [[ "${INTENT_SEED_DRY_RUN:-SIM}" != "NAO" ]]; then
  echo "DRY RUN: nenhuma escrita será feita."
  INTENT_SEED_DRY_RUN=SIM npm run seed:social-demo
else
  [[ "${INTENT_ALLOW_SOCIAL_SEED:-}" == "SIM" ]] || fail "para gravar, use INTENT_ALLOW_SOCIAL_SEED=SIM INTENT_SEED_DRY_RUN=NAO"
  INTENT_ALLOW_SOCIAL_SEED=SIM INTENT_SEED_DRY_RUN=NAO npm run seed:social-demo
fi

section "Resumo"

echo "RUNNER_OK=$VERSION"
echo "HEAD=$(git -C "$REPO" rev-parse HEAD)"
echo "REF_FINAL=$SEED_REF"
echo "MODO_FINAL=${INTENT_SEED_DRY_RUN:-SIM}"
