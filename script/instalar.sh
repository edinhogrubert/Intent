#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
# Instala somente o ambiente local. Não faz SSH, download ou deploy.
ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
ENVIRONMENT="${1:-}"
[[ "$ENVIRONMENT" == pc || "$ENVIRONMENT" == vm ]] || { echo 'Uso: instalar.sh pc|vm SHA_COMPLETO'; exit 2; }
REVISION="${2:-}"
[[ "$REVISION" =~ ^[0-9a-f]{40}$ ]] || { echo 'SHA completo obrigatório'; exit 2; }
source "$ROOT/script/lib/comum.sh"
require_environment
REPO="$ROOT"
INTENT_EXPECTED_COMMIT="$REVISION"
require_approved_revision
[[ "$(git -C "$ROOT" rev-parse HEAD)" == "$REVISION" ]] || { echo 'Revisão local diferente da aprovada'; exit 1; }
[[ -z "$(git -C "$ROOT" status --porcelain)" ]] || { echo 'Checkout sujo'; exit 1; }
BASE="${INTENT_BASE:-$HOME/intent-automacao}"
mkdir -p "$BASE/releases"
exec 9>"$BASE/instalar.lock"
flock -n 9
STAGE="$(mktemp -d "$BASE/releases/.partial-XXXXXXXX")"
trap 'rm -rf -- "$STAGE" "${LINK:-}"' EXIT
# git archive copia apenas conteúdo versionado aprovado, sem .env/untracked.
git -C "$ROOT" archive "$REVISION" script | tar -x -C "$STAGE"
while IFS= read -r -d '' file; do bash -n "$file"; done < <(find "$STAGE/script" -name '*.sh' -print0)
bash "$STAGE/script/intent.sh" "$ENVIRONMENT" list
(cd "$STAGE"; find script -type f -print0 | sort -z | xargs -0 sha256sum > SHA256SUMS; sha256sum -c SHA256SUMS >/dev/null)
printf '%s\n' "$REVISION" > "$STAGE/REVISION"
DEST="$BASE/releases/$REVISION"
[[ ! -e "$DEST" ]] || { echo 'Versão já existe; não sobrescrever pacote instalado'; exit 1; }
mv "$STAGE" "$DEST"
LINK="$BASE/.current-$$"
ln -s "releases/$REVISION" "$LINK"
mv -Tf "$LINK" "$BASE/current"
printf 'Ativado: %s; versões anteriores preservadas em %s/releases\n' "$REVISION" "$BASE"
# Não substitui executores antigos fora do checkout; migração é explícita no manual.
