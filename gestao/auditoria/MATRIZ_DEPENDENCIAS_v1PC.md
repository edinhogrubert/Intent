# Matriz de dependências e duplicações — v1PC

Data 2026-09-18. Fonte: leitura de arquivos e árvores da `main`. Estado: auditoria parcial, nenhuma migração executada. Branch `chore/auditoria-gestao-v1-20260918`.

## Dependência concreta: executor PC

Fonte `scripts/executores/instalar-executor-PC.sh`, blob `c7619392f18cbef26d1bdda491635bf0eedbed42`.

- `BASE=/home/grubert/intent-automacao` e `TARGET="$BASE/intent-executor-PC.sh"`: destino no PC, não é caminho da documentação.
- `REF=${INTENT_EXECUTOR_REF:-main}`: por padrão consulta main.
- `SRC_URL=${INTENT_EXECUTOR_PC_URL:-https://raw.githubusercontent.com/edinhogrubert/Intent/$REF/scripts/executores/intent-executor-PC.sh}`: referência explícita ao caminho do repositório.
- `curl` baixa para arquivo temporário; `bash -n` verifica sintaxe; cria backup do executor anterior quando existe; `mv -f` substitui TARGET; `bash "$TARGET" list` lista funções.
- Dependências externas declaradas: `curl`, `bash`, `mktemp`, `date`, `chmod`, `cp`, `mv`, além de `flock`, `id`, `hostname`, `mkdir`, `rm` usados pelo script. Ambiente exige usuário `grubert`, hostname curto `lubuntu`.
- Se o executor for movido dentro do repositório, ajustar a URL padrão do instalador e todas as referências ao caminho antigo. Isso não exige executar instalação durante a auditoria.
- Atenção: o instalador substitui o arquivo de destino; não executar nem reutilizar automaticamente em migração de versões preservadas.

## Dependência documental

`contratos/README.md`, blob `acb979c05188749b7df946065d9ed544463507f0`, referencia os sete documentos de contrato, os quatro scripts de executores/instaladores e dois arquivos em `docs/ai-handoff/continuidade/`; define ordem de autoridade e exige atualização de caminhos de arquitetura. Mover `contratos/` ou `docs/ai-handoff/` requer reescrever e validar essas referências em conjunto.

## Inventário de pastas com evidência direta

- `contratos/`: árvore não truncada, 8 arquivos: `README.md`, `ARQUITETURA_ATUAL_PC.md`, `ARQUITETURA_ATUAL_VM.md`, `CONTRATO_AGENTES_LABORATORIO_INTEGRACAO.md`, `CONTRATO_AGENTE_SENIOR_CHATGPT.md`, `FLUXO_FUNCIONALIDADE.md`, `INTERFACE_EXECUTORES.md`, `MAPA_SCRIPTS_OPERACIONAIS.md`.
- `docs/`: inclui `RECUPERACAO_MAIN.md` e `ai-handoff/` com blocos e continuidade. Árvore recursiva retornada foi truncada na exibição; contagem total ainda não certificada.
- Raiz `main`: presença confirmada de `AGENTS.md`, `JIRA.md`, `ProximasFuncionalidades.md`, `Nova pasta/`, `archive/`, `assets/`, `backend/`, `contratos/`, `deploy/`, `docs/`, `.github/` e configurações técnicas. Resposta de listagem da raiz truncada; inventário total pendente.

## Duplicatas de conteúdo comprovadas por SHA em `Nova pasta/`

- `27-preparar-pacote-consolidado.sh`, `27-preparar-pacote-consolidado1.sh`, `27-preparar-pacote-consolidadoOK.sh`: SHA `7787d68c197fa4c2dafb0ed86dbd818efeb9d00d`.
- `31-etapa2-backup-completo (1).sh` e `31-etapa2-backup-completo.sh`: SHA `514bfaf684920efdedb18948a043a2b160f2ac37`.
- `32-etapa3-alinhar-codigo-main.sh` e `32-etapa3-alinhar-codigo-main1.sh`: SHA `090653a0a7184e362fcce31b5f1aba1eeca0150d`.
- `32-etapa3-alinhar-codigo-main2 (1).sh` e `32-etapa3-alinhar-codigo-main2.sh`: SHA `7c40dceb9e0078dfb494c01ff3e9c56ce467dd9a`.
- `32-etapa3-alinhar-codigo-main3 (1).sh` e `32-etapa3-alinhar-codigo-main3.sh`: SHA `f0edbc248c37f150ce7fd69ed0e6ae8283ae0234`.
- `33-etapa4-validar-main.sh` e `33-etapa4-validar-main1.sh`: SHA `1ac5d3c0fa31d01a3222ee3a8335a73734026682`.
- `33-etapa4-validar-main2 (1).sh` e `33-etapa4-validar-main2.sh`: SHA `960c191806aa9d0b0eaa22af2b956f063856e81f`.
- `33-etapa4-validar-main3 (1).sh` e `33-etapa4-validar-main3.sh`: SHA `82f12133d6eb8923711d88c20b0d112c4a2ef027`.

SHAs iguais comprovam conteúdo idêntico nesses grupos, mas não autorizam exclusão sem checar consumidores e retenção histórica. Nomes `old` e sufixos diferentes com SHA diferente não são duplicatas comprovadas.

## Próxima fase

Completar inventário não truncado por subárvores, ler documentos candidatos a fonte vigente, mapear chamadas e links em todo repositório e propor um patch de movimentação com testes. Não executar scripts de produção, não atualizar `main`, não mover nem excluir arquivos nesta fase.
