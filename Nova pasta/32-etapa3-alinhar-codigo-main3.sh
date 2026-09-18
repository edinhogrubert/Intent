#!/usr/bin/env bash
set -Eeuo pipefail

SOURCE_DIR="/opt/intent/source"
EXPECTED_MAIN="62e78cc040afc08e13c44e2fd943134643e05231"
GIT_USER="ubuntu"

echo "================================================================"
echo "INTENT — ETAPA 3: ALINHAR CÓDIGO À MAIN"
echo "================================================================"
echo "Somente o checkout Git será alterado. Serviços não serão reiniciados."

[[ -d "${SOURCE_DIR}/.git" ]] || { echo "ERRO: repositório não encontrado."; exit 1; }

echo "[1/5] Confirmando que não existem alterações locais..."
if [[ -n "$(sudo -H -u "${GIT_USER}" git -C "${SOURCE_DIR}" status --porcelain)" ]]; then
  echo "ERRO: existem alterações locais ou arquivos não rastreados."
  sudo -H -u "${GIT_USER}" git -C "${SOURCE_DIR}" status --short
  exit 1
fi

echo "[2/5] Buscando a main remota..."
sudo -H -u "${GIT_USER}" git -C "${SOURCE_DIR}" fetch origin main
REMOTE_SHA="$(sudo -H -u "${GIT_USER}" git -C "${SOURCE_DIR}" rev-parse FETCH_HEAD)"
[[ "${REMOTE_SHA}" == "${EXPECTED_MAIN}" ]] || {
  echo "ERRO: a main remota mudou durante o processo."
  echo "Esperado: ${EXPECTED_MAIN}"
  echo "Recebido: ${REMOTE_SHA}"
  exit 1
}

echo "[3/5] Posicionando a VM no commit exato da main..."
sudo -H -u "${GIT_USER}" git -C "${SOURCE_DIR}" switch --detach "${EXPECTED_MAIN}"

echo "[4/5] Confirmando o alinhamento..."
LOCAL_SHA="$(sudo -H -u "${GIT_USER}" git -C "${SOURCE_DIR}" rev-parse HEAD)"
[[ "${LOCAL_SHA}" == "${EXPECTED_MAIN}" ]] || { echo "ERRO: checkout não confirmou o commit."; exit 1; }

echo "[5/5] Confirmando que os serviços não foram alterados..."
docker ps --format '{{.Names}}|{{.Status}}' | grep -E '^intent-(frontend|api|postgres|redis)\|' || true

echo
echo "================================================================"
echo "ETAPA 3 CONCLUÍDA"
echo "================================================================"
echo "Commit da VM:   ${LOCAL_SHA}"
echo "Commit da main: ${EXPECTED_MAIN}"
echo "Código alinhado. Nenhum serviço foi reiniciado."

