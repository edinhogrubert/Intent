#!/usr/bin/env bash
set -Eeuo pipefail
BASE=/home/grubert/intent-automacao
REPO=/home/grubert/Projetos/Intent-local
STATE="$BASE/retomada/estado-trabalho.txt"
RELEASE=mvp-1.0.23
COMMIT=4cbdc3ad5b3b6e5e699123f7e0389f98c4f4da6f
REMOTE=ubuntu@157.151.255.227
KEY=/home/grubert/.ssh/id_ed25519
[[ "$(id -un)" == grubert && "$(hostname -s)" == lubuntu ]] || { echo 'ERRO: PC incorreto'; exit 1; }
[[ -f "$STATE" && -r "$KEY" && -d "$REPO/.git" ]] || { echo 'ERRO: pre-requisitos ausentes'; exit 1; }
mkdir -p "$BASE/retomada/relatorios"
exec 9>"$BASE/retomada/atualizacao.lock"
flock -n 9 || { echo 'ERRO: outra atualizacao em andamento'; exit 1; }
SSH=(ssh -i "$KEY" -o IdentitiesOnly=yes -o BatchMode=yes -o ConnectTimeout=12 "$REMOTE")
MANIFEST="$BASE/release-aprovada.env"
[[ -r "$MANIFEST" ]] || { echo 'ERRO: manifesto PC ausente'; exit 1; }
grep -Fxq "RELEASE=$RELEASE" "$MANIFEST" && grep -Fxq "COMMIT=$COMMIT" "$MANIFEST" || { echo 'ERRO: manifesto PC mudou; abortado'; exit 1; }
[[ "$(git -C "$REPO" rev-parse HEAD)" == "$COMMIT" && -z "$(git -C "$REPO" status --porcelain)" ]] || { echo 'ERRO: PC nao corresponde ao estado confirmado'; exit 1; }
[[ "$(git -C "$REPO" rev-parse "refs/tags/$RELEASE^{commit}")" == "$COMMIT" ]] || { echo 'ERRO: tag PC divergente'; exit 1; }
"${SSH[@]}" "test \"\$(hostname -s)\" = intent-app-01 && test \"\$(git -C /opt/intent/source rev-parse HEAD)\" = $COMMIT && test -z \"\$(git -C /opt/intent/source status --porcelain)\" && grep -Fxq 'RELEASE=$RELEASE' /home/ubuntu/intent-executor/release-aprovada.env && grep -Fxq 'COMMIT=$COMMIT' /home/ubuntu/intent-executor/release-aprovada.env" || { echo 'ERRO: VM divergiu; registro nao alterado'; exit 1; }
# Conferencia remota do GitHub, sem modificar refs locais.
REMOTE_HEAD="$(git -C "$REPO" ls-remote origin refs/heads/main | awk '{print $1}')" || { echo 'ERRO: GitHub indisponivel; registro nao alterado'; exit 1; }
[[ "$REMOTE_HEAD" == "$COMMIT" ]] || { echo "ERRO: GitHub main divergiu ($REMOTE_HEAD); registro nao alterado"; exit 1; }
# Evitar sobrescrever decisoes posteriores ou registros desconhecidos.
grep -Fq 'TRABALHO ATUAL: instalar e testar consulta integrada de retomada PC + Git local + VM.' "$STATE" || { echo 'ERRO: registro foi modificado; nao sobrescrever automaticamente'; exit 1; }
TMP="$(mktemp "$BASE/retomada/.estado-trabalho.XXXXXXXX")"
trap 'rm -f "$TMP"' EXIT
cat > "$TMP" <<TEXT
INTENT | REGISTRO DE CONTINUIDADE
Atualizado em: $(date --iso-8601=seconds)
Origem: relatorio de retomada de 2026-09-17 16:38, verificacao PC/VM e consulta GitHub; historico de produto conforme merge PR #25.
ESTADO CONFIRMADO: release aprovada $RELEASE; commit $COMMIT; PC, GitHub main e VM alinhados; repositorios PC/VM limpos; consulta integrada PC + Git local + VM instalada e testada. Na ultima consulta enviada, quatro containers saudaveis e tres endpoints HTTP 200. Backups Git PC e PostgreSQL VM executados e validados anteriormente.
ULTIMA ENTREGA DE PRODUTO CONFIRMADA: Bloco 24, atividade do perfil publico, integrado na main pelo PR #25. Nenhum bloco seguinte confirmado neste registro.
TRABALHO ATUAL: retomada integrada instalada, testada e concluida; registro de continuidade atualizado.
PENDENCIA OPERACIONAL: rotina independente de backup Git ainda fixa $RELEASE; tarefa 6 bloqueia outras releases ate atualizacao.
PENDENCIA DE PROCESSO: automatizar a atualizacao do registro ao fim de cada entrega; hoje a atualizacao deste registro e controlada por instalador e verificacoes.
PROXIMA ACAO: selecionar e especificar a proxima funcionalidade do Intent antes de iniciar implementacao. Nenhuma funcionalidade nova foi autorizada neste registro.
REGRAS: PC, GitHub e VM devem ser conferidos no ciclo de entrega; diferenciar desenvolvimento, merge e deploy; nao tratar origin/main local como GitHub remoto atual; nao executar commit, push, merge, backup ou deploy sem autorizacao especifica.
TEXT
chmod 600 "$TMP"
BACKUP="$STATE.bak-$(date +%Y%m%d-%H%M%S)-$$"
cp -p "$STATE" "$BACKUP"
mv -f "$TMP" "$STATE"
trap - EXIT
echo "OK: registro corrigido. Copia anterior: $BACKUP"
echo 'OK: PC, GitHub remoto e VM conferidos; Git e aplicacao nao alterados.'
echo '=== REGISTRO ATUALIZADO ==='
cat "$STATE"
echo '=== FIM ==='
