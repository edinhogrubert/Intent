# Bloqueios verificados — executores após movimentação documental

Data: 2026-09-19. Escopo: leitura estática dos seis arquivos da árvore `scripts/executores/` na branch `chore/auditoria-gestao-v1-20260918`; leitura integral dos executores PC e VM, bootstrap e README, além do instalador PC. **Nenhum script foi executado, instalado ou modificado nesta auditoria.**

## BLOQUEADOR 1 — função 9 PC

Arquivo: `scripts/executores/intent-executor-PC.sh`, blob `366b55981e8db5caed31d8d51613db64852edb01`.

`task_9` exige os caminhos antigos `contratos/README.md`, `contratos/INTERFACE_EXECUTORES.md`, `contratos/ARQUITETURA_ATUAL_VM.md`, `docs/ai-handoff/continuidade/ESTADO_ATUAL_INTENT.md` e `docs/ai-handoff/continuidade/PROMPT_RETOMADA_CHATGPT.md`. Eles foram retirados da raiz desta branch. As localizações novas confirmadas são, respectivamente, `gestao/governanca/contratos/README.md`, `gestao/governanca/contratos/INTERFACE_EXECUTORES.md`, `gestao/governanca/contratos/ARQUITETURA_ATUAL_VM.md`, `gestao/comunicacao/ai-handoff/continuidade/ESTADO_ATUAL_INTENT.md` e `gestao/comunicacao/ai-handoff/continuidade/PROMPT_RETOMADA_CHATGPT.md`.

**Consequência prevista pela leitura do código:** após instalar esse executor a partir da branch reorganizada, a função PC 9 reportará `continuidade incompleta`; `task_10` depende de `task_9`, e `task_11` depende de `task_10`. Não afirmar que houve falha real no PC: o executor não foi executado.

## BLOQUEADOR 2 — função 9 VM

Arquivo: `scripts/executores/intent-executor-VM.sh`, blob `08ddbf2537a4a794c6230d9d9c9a7ea7254d51d5`.

`task_9` exige `contratos/README.md`, `contratos/INTERFACE_EXECUTORES.md`, `contratos/ARQUITETURA_ATUAL_VM.md` e `docs/ai-handoff/continuidade/ESTADO_ATUAL_INTENT.md`. Os quatro destinos correspondentes são os caminhos em `gestao/` indicados acima. Após instalar esse executor a partir da branch reorganizada e sincronizar o checkout, a função VM 9 tenderá a falhar na checagem estática. Nenhuma falha em produção foi observada.

## Risco de propagação

O arquivo `scripts/executores/baixar-e-atualizar-executores.sh` pode baixar instaladores e substituir executores tanto no PC quanto na VM. Sua seleção de refs inclui `INTENT_EXECUTOR_REF`, `main` e `docs/contratos-agentes`; o texto de erro ainda menciona o ref histórico. `scripts/executores/instalar-executor-PC.sh` tem padrão `main` e instala o script obtido da ref indicada. **Não usar o bootstrap para validar esta reorganização** e não apontá-lo à branch enquanto as funções 9 não estiverem corrigidas e revisadas. A `main` e os executores atualmente instalados não foram alterados nesta auditoria.

## Ação obrigatória antes de integrar

1. Corrigir `task_9` em ambos os executores para os destinos canônicos em `gestao/`, sem modificar numeração, comportamento de outras funções, instalação ou deploy.
2. Revisar `scripts/executores/README.md`: ele afirma incorretamente que `intent-backup-git-PC.sh` é chamado pela função 6; o executor PC lido cria bundle internamente e apenas avisa sobre o legado.
3. Validar estaticamente os scripts corrigidos com `bash -n`, comparar diff para garantir que somente a checagem de caminhos mudou e inspecionar consumidores restantes. Não executar as funções 7, 11 ou 12 como teste da reorganização.
4. Atualizar este relatório com SHAs novos, resultados reais da validação e resolução dos bloqueios. Até lá, **aceite da migração: BLOQUEADO**.

Este documento registra evidência, não substitui a correção do código. A matriz `MATRIZ_DEPENDENCIAS_v1PC.md` é um levantamento anterior à migração e não deve ser lida como estado vigente.
