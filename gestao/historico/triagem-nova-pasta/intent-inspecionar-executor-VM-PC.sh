#!/usr/bin/env bash
set -Eeuo pipefail
REMOTE="ubuntu@157.151.255.227"
KEY="${HOME}/.ssh/id_ed25519"
TARGET="/home/ubuntu/intent-executor-VM.sh"
[[ -r "$KEY" ]] || { echo "ERRO: chave SSH nao encontrada: $KEY"; exit 1; }
mkdir -p "${HOME}/intent-automacao/diagnosticos"
REPORT="${HOME}/intent-automacao/diagnosticos/executor-VM-$(date +%Y%m%d-%H%M%S).txt"
echo "Inspecionando executor da VM por SSH (somente leitura)..."
if ! ssh -i "$KEY" -o IdentitiesOnly=yes -o BatchMode=yes -o ConnectTimeout=10 "$REMOTE" 'bash -s' > "$REPORT" <<'REMOTE_SCRIPT'
set -Eeuo pipefail
TARGET=/home/ubuntu/intent-executor-VM.sh
[[ "$(id -un)" == ubuntu && -f "$TARGET" ]] || { echo 'ERRO: executor nao encontrado ou usuario incorreto'; exit 1; }
echo '=== ESTRUTURA DO EXECUTOR VM ==='
wc -l "$TARGET"
echo '=== VALIDACAO DE SINTAXE ==='
bash -n "$TARGET" && echo 'OK'
echo '=== CODIGO DO EXECUTOR (sem executar tarefas) ==='
sed -n '1,320p' "$TARGET"
echo '=== FIM ==='
REMOTE_SCRIPT
then
  cat "$REPORT"
  echo "ERRO: inspecao SSH falhou. Relatorio parcial: $REPORT"
  exit 1
fi
cat "$REPORT"
echo "Relatorio salvo em: $REPORT"
echo 'Nenhuma alteracao realizada na VM.'
