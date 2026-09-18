#!/usr/bin/env bash
set -Eeuo pipefail

# =====================================================================
# Intent — Bootstrap único dos executores PC/VM
#
# Uso humano:
#   1. Baixar este arquivo para ~/Downloads
#   2. Executar este arquivo
#
# O script busca os instaladores no GitHub, atualiza o executor do PC
# e atualiza o executor da VM via SSH.
#
# Importante:
# - Este é o único script manual de bootstrap.
# - Depois dele, o fluxo normal volta a ser função PC(...) e função VM(...).
# - Scripts auxiliares não devem ser chamados diretamente.
# =====================================================================

BOOTSTRAP_VERSION="intent-bootstrap-2026.09.18.03"
EXECUTOR_INTERFACE_VERSION="intent-executor-interface-2026.09.18.03"
OWNER_REPO="edinhogrubert/Intent"
BRANCH_CANDIDATES=("${INTENT_EXECUTOR_REF:-}" "main" "docs/contratos-agentes")
RAW_BASE="https://raw.githubusercontent.com/${OWNER_REPO}"
PC_INSTALLER="scripts/executores/instalar-executor-PC.sh"
VM_INSTALLER="scripts/executores/instalar-executor-VM.sh"

VM_HOST="${INTENT_VM_HOST:-157.151.255.227}"
VM_USER="${INTENT_VM_USER:-ubuntu}"
VM_SSH_KEY="${INTENT_VM_SSH_KEY:-$HOME/.ssh/id_ed25519}"

DOWNLOADS_DIR="${HOME}/Downloads"
LOG_DIR="${DOWNLOADS_DIR}/intent-relatorios"
STAMP="$(date +%Y%m%d-%H%M%S)"
LOG_FILE="${LOG_DIR}/bootstrap-executores-${STAMP}.log"
TMP_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

mkdir -p "$LOG_DIR"
exec > >(tee -a "$LOG_FILE") 2>&1

section() {
  echo
  echo "================================================================"
  echo "$1"
  echo "================================================================"
}

fail() {
  echo "ERRO: $1"
  echo "VERSAO_BOOTSTRAP=${BOOTSTRAP_VERSION}"
  echo "VERSAO_INTERFACE=${EXECUTOR_INTERFACE_VERSION}"
  echo "Log salvo em: $LOG_FILE"
  exit 1
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "comando obrigatório ausente: $1"
}

file_sha256() {
  local path="$1"
  if [[ -f "$path" ]] && command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$path" | awk '{print $1}'
  else
    echo "indisponivel"
  fi
}

fetch_ok() {
  local ref="$1"
  curl --fail --silent --location --head "${RAW_BASE}/${ref}/${PC_INSTALLER}" >/dev/null 2>&1 && \
  curl --fail --silent --location --head "${RAW_BASE}/${ref}/${VM_INSTALLER}" >/dev/null 2>&1
}

resolve_ref() {
  local ref
  for ref in "${BRANCH_CANDIDATES[@]}"; do
    [[ -n "$ref" ]] || continue
    if fetch_ok "$ref"; then
      echo "$ref"
      return 0
    fi
  done
  return 1
}

section "Intent — bootstrap único dos executores"

echo "VERSAO_BOOTSTRAP=${BOOTSTRAP_VERSION}"
echo "VERSAO_INTERFACE=${EXECUTOR_INTERFACE_VERSION}"
echo "Log: $LOG_FILE"
echo "Usuário local: $(id -un)"
echo "Host local: $(hostname -s)"
echo "Diretório atual: $(pwd)"
echo "VM alvo: ${VM_USER}@${VM_HOST}"
echo "Chave SSH: ${VM_SSH_KEY}"

[[ "$(id -un)" == "grubert" ]] || fail "este bootstrap deve rodar no PC como usuário grubert"
[[ "$(hostname -s)" == "lubuntu" ]] || fail "este bootstrap deve rodar no PC lubuntu"
[[ -d "$DOWNLOADS_DIR" ]] || fail "pasta Downloads não encontrada: $DOWNLOADS_DIR"
[[ -f "$VM_SSH_KEY" ]] || fail "chave SSH não encontrada: $VM_SSH_KEY"

need_cmd bash
need_cmd curl
need_cmd mktemp
need_cmd date
need_cmd tee
need_cmd ssh
need_cmd sha256sum

SSH_OPTS=(
  -i "$VM_SSH_KEY"
  -o BatchMode=yes
  -o ConnectTimeout=12
  -o ServerAliveInterval=60
  -o ServerAliveCountMax=3
  -o StrictHostKeyChecking=accept-new
)

REF="$(resolve_ref)" || fail "não encontrei instaladores no GitHub em main nem em docs/contratos-agentes"

echo "Fonte GitHub: ${OWNER_REPO}"
echo "Referência escolhida: ${REF}"

section "Atualizando executor do PC"

PC_TMP="${TMP_DIR}/instalar-executor-PC.sh"
curl --fail --silent --show-error --location "${RAW_BASE}/${REF}/${PC_INSTALLER}" -o "$PC_TMP"
bash -n "$PC_TMP" || fail "instalador PC baixado possui sintaxe inválida"
INTENT_EXECUTOR_REF="$REF" bash "$PC_TMP"

section "Verificando executor do PC"

bash /home/grubert/intent-automacao/intent-executor-PC.sh list
PC_EXECUTOR_SHA256="$(file_sha256 /home/grubert/intent-automacao/intent-executor-PC.sh)"
echo "PC_EXECUTOR_SHA256=${PC_EXECUTOR_SHA256}"

section "Atualizando executor da VM via SSH"

ssh "${SSH_OPTS[@]}" "${VM_USER}@${VM_HOST}" 'true' || fail "SSH para ${VM_USER}@${VM_HOST} falhou"

echo "SSH OK para ${VM_USER}@${VM_HOST}"

echo "Instalando/atualizando executor VM a partir do GitHub..."
ssh "${SSH_OPTS[@]}" "${VM_USER}@${VM_HOST}" \
  "INTENT_EXECUTOR_REF='${REF}' bash -c \"\$(curl -fsSL ${RAW_BASE}/${REF}/${VM_INSTALLER})\""

section "Verificando executor da VM"

ssh "${SSH_OPTS[@]}" "${VM_USER}@${VM_HOST}" \
  'bash /home/ubuntu/intent-executor-VM.sh list'
VM_EXECUTOR_SHA256="$(ssh "${SSH_OPTS[@]}" "${VM_USER}@${VM_HOST}" 'sha256sum /home/ubuntu/intent-executor-VM.sh 2>/dev/null | awk '\''{print $1}'\'' || echo indisponivel')"
echo "VM_EXECUTOR_SHA256=${VM_EXECUTOR_SHA256}"

section "Resumo"

echo "VERSAO_BOOTSTRAP=${BOOTSTRAP_VERSION}"
echo "VERSAO_INTERFACE=${EXECUTOR_INTERFACE_VERSION}"
echo "PC_EXECUTOR_SHA256=${PC_EXECUTOR_SHA256}"
echo "VM_EXECUTOR_SHA256=${VM_EXECUTOR_SHA256}"
echo "PC: executor instalado/atualizado e listado."
echo "VM: executor instalado/atualizado via SSH e listado."
echo "Fonte usada: ${OWNER_REPO}@${REF}"
echo "Log salvo em: ${LOG_FILE}"
echo

echo "A partir de agora, o fluxo humano deve chamar apenas:"
echo "  função PC(...)"
echo "  função VM(...)"
echo
echo "Comandos diretos para scripts auxiliares continuam proibidos no fluxo normal."
