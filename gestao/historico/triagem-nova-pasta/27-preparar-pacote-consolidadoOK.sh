#!/usr/bin/env bash
set -Eeuo pipefail

SOURCE_DIR="/opt/intent/source"
BACKUP_DIR="/opt/intent/backups/source"
DATE_TAG="$(date +%Y-%m-%d_%H-%M-%S)"
WORK_DIR="$(mktemp -d /tmp/intent-consolidado.XXXXXX)"
PACKAGE="${BACKUP_DIR}/intent-consolidado-${DATE_TAG}.tar.gz"
CHECKSUM="${PACKAGE}.sha256"

cleanup() { rm -rf "${WORK_DIR}"; }
trap cleanup EXIT

[[ -d "${SOURCE_DIR}/.git" ]] || { echo "ERRO: repositório não encontrado em ${SOURCE_DIR}"; exit 1; }
mkdir -p "${BACKUP_DIR}"

echo "[1/7] Validando a cópia funcional..."
git -C "${SOURCE_DIR}" diff --quiet || { echo "ERRO: existem alterações locais em ${SOURCE_DIR}."; exit 1; }

echo "[2/7] Atualizando referência da antiga main..."
git -C "${SOURCE_DIR}" fetch origin main
OLD_MAIN="$(git -C "${SOURCE_DIR}" rev-parse FETCH_HEAD)"

echo "[3/7] Copiando a versão funcional para área temporária..."
mkdir -p "${WORK_DIR}/Intent"
rsync -a --exclude='.git' --exclude='node_modules' --exclude='backend/node_modules' \
  --exclude='dist' --exclude='runtime' --exclude='backups' \
  "${SOURCE_DIR}/" "${WORK_DIR}/Intent/"

echo "[4/7] Preservando a antiga main em archive/intentV1..."
mkdir -p "${WORK_DIR}/Intent/archive/intentV1"
git -C "${SOURCE_DIR}" archive "${OLD_MAIN}" | tar -x -C "${WORK_DIR}/Intent/archive/intentV1"

echo "[5/7] Removendo somente referências obsoletas da raiz..."
for path in \
  JIRA.md assets/.aistudio/.gitignore firebase-blueprint.json firestore.rules metadata.json \
  projatual.md revisar.md visaodedoisenior.md \
  src/components/AccountStatusCard.tsx src/components/ApprovalWorkflow.tsx \
  src/components/BottomCardsRow.tsx src/components/DeleteAccountModal.tsx \
  src/components/DevInspectorBadge.tsx src/components/DynamicGreetingCard.tsx \
  src/components/ExploreFeedView.tsx src/components/IntentCelebrationView.tsx \
  src/components/IntentDetailView.tsx src/components/IntentManager.tsx \
  src/components/IntentStructureModal.tsx src/components/LandingHeroView.tsx \
  src/components/MessagesView.tsx src/components/MobileBottomNav.tsx \
  src/components/NotificationsView.tsx src/components/ParticipantManager.tsx \
  src/components/ProtectedVaultPipeline.tsx src/components/PublicSupportWorkflow.tsx \
  src/components/SettingsView.tsx src/components/Sidebar.tsx \
  src/components/SocialHistoryWorkflow.tsx src/components/StagesChecklistModal.tsx \
  src/components/TesterProfileSwitcherBar.tsx src/components/UserProfileModal.tsx \
  src/components/UserProfileView.tsx src/utils/conditionEvaluator.ts \
  src/utils/cryptoVault.ts src/utils/intentSchema.ts src/utils/testPersonas.ts \
  src/utils/time.ts src/utils/timeCondition.ts; do
  rm -f "${WORK_DIR}/Intent/${path}"
done

find "${WORK_DIR}/Intent" -type d -empty -delete
find "${WORK_DIR}/Intent" -type f \( -name '.env' -o -name '*.pem' -o -name '*.key' -o -name '*service-account*.json' \) -print -delete

echo "[6/7] Verificando conteúdo e criando pacote..."
test -f "${WORK_DIR}/Intent/README.md" || echo "AVISO: README.md ainda não existe."
test -d "${WORK_DIR}/Intent/archive/intentV1" || { echo "ERRO: archive/intentV1 não foi criado."; exit 1; }
tar -czf "${PACKAGE}" -C "${WORK_DIR}" Intent
sha256sum "${PACKAGE}" | tee "${CHECKSUM}"

echo "[7/7] Pacote pronto"
echo "Pacote:  ${PACKAGE}"
echo "Checksum: ${CHECKSUM}"
echo "Antiga main: ${OLD_MAIN}"
echo "A fonte original não foi modificada."
