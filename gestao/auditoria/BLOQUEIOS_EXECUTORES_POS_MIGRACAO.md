# Auditoria dos executores após movimentação documental

Atualização: 2026-09-19. Branch exclusiva: `chore/auditoria-gestao-v1-20260918`. Este relatório substitui o diagnóstico inicial de bloqueios, preservando os SHAs anteriores para rastreabilidade. Nenhum executor foi instalado ou executado no PC ou na VM; a `main` não foi alterada.

## Função 9 — correções publicadas, validação operacional pendente

Commit de correção: `014ab9b3860319f831eab0af0daf696a54133f5f` (`fix(executores): update function 9 paths for PC and VM`). O diff retornado pelo GitHub para esse commit contém exatamente dois arquivos e uma substituição de linha `local files=(...)` em cada um. Não altera numeração, funções 1–8 ou 10–15, instalação nem deploy.

- PC: `scripts/executores/intent-executor-PC.sh`. Blob anterior `366b55981e8db5caed31d8d51613db64852edb01`; blob atualizado confirmado por leitura da branch: `1d720fc34b183e7e0badb9f8559898a41d3bfdea`. A função 9 verifica `gestao/governanca/contratos/README.md`, `gestao/governanca/contratos/INTERFACE_EXECUTORES.md`, `gestao/governanca/contratos/ARQUITETURA_ATUAL_VM.md`, `gestao/comunicacao/ai-handoff/continuidade/ESTADO_ATUAL_INTENT.md` e `gestao/comunicacao/ai-handoff/continuidade/PROMPT_RETOMADA_CHATGPT.md`. As funções 10 e 11 dependem da preparação e continuam exigindo suas demais pré-condições.
- VM: `scripts/executores/intent-executor-VM.sh`. Blob anterior `08ddbf2537a4a794c6230d9d9c9a7ea7254d51d5`; blob atualizado confirmado por leitura da branch: `211c8c4df27eaf936b20f67bb5235424cb7f065a`. A função 9 verifica os mesmos três contratos e `gestao/comunicacao/ai-handoff/continuidade/ESTADO_ATUAL_INTENT.md`.
- Os dois scripts ainda declaram `IDS=(1 2 3 4 5 6 7 8 9 10 11 12 13 14 15)`. Isso comprova a definição da interface no código consultado, não a operação efetiva de todas as funções nos ambientes instalados.

**Resultado:** o bloqueio específico dos caminhos antigos na função 9 está corrigido no código desta branch. Não há evidência de que os executores instalados tenham sido atualizados ou de que a função 9 tenha sido executada com sucesso.

## README operacional — inconsistência corrigida

O `scripts/executores/README.md` foi corrigido no commit `3978aebd34c02a640d03b8ceaf890f93360e756a`, blob resultante `71462bfb259c4b883fbabfc850d7768c742d0743`. A função PC 6 cria e verifica o bundle internamente. O script `/home/grubert/intent-automacao/intent-backup-git-PC.sh` é legado, não é invocado pela função 6 e não deve ser executado diretamente. O mapa `gestao/governanca/contratos/MAPA_SCRIPTS_OPERACIONAIS.md` já descrevia esse comportamento.

## Riscos e verificações restantes

1. **Sintaxe:** `bash -n` dos dois scripts atualizados ainda não foi executado. O ambiente local desta auditoria não conseguiu resolver `github.com` para baixar os arquivos; não registrar PASS de sintaxe sem execução real. O diff do commit de correção foi inspecionado pelo conector GitHub e restringe-se às duas linhas de caminhos.
2. **Consumidores:** fazer varredura integral da árvore vigente por referências a `contratos/`, `docs/`, `Nova pasta/` e aos seis arquivos Markdown retirados da raiz. Corrigir referências ativas em scripts, workflows, configurações e links relativos; preservar menções históricas com indicação de contexto. A revisão global ainda não foi concluída.
3. **Bootstrap/instalação:** `scripts/executores/baixar-e-atualizar-executores.sh` seleciona refs incluindo `INTENT_EXECUTOR_REF`, `main` e `docs/contratos-agentes`; instaladores têm padrão `main`. Não apontar o bootstrap à branch nem executar instaladores como teste documental. A `main` e os executores instalados não foram alterados.
4. **Segurança operacional:** não executar funções 7 (sincronização), 11 (release) ou 12 (deploy) para testar a reorganização. A validação estática não comprova comportamento de produção.
5. **Documentação histórica:** `gestao/auditoria/MATRIZ_DEPENDENCIAS_v1PC.md` descreve levantamento anterior à migração; não usar como estado vigente.

**Aceite da fase de executores:** correção de caminhos e alinhamento do README concluídos no código; validação sintática e conferência de consumidores pendentes. **Aceite da reorganização completa: BLOQUEADO** até a auditoria de referências, testes seguros e revisão final do diff.
