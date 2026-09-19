# Auditoria dos executores após movimentação documental

Atualização: 2026-09-19. Branch exclusiva: `chore/auditoria-gestao-v1-20260918`. Este relatório substitui o diagnóstico inicial de bloqueios, preservando os SHAs anteriores para rastreabilidade. Nenhum executor foi instalado ou executado no PC ou na VM; a `main` não foi alterada.

## Função 9 — correções publicadas e validação estática aprovada

Commit de correção: `014ab9b3860319f831eab0af0daf696a54133f5f`. Comparação GitHub do commit com seu pai `583ab563f0aa8a450b1b785cdc333c563f096a5f`: exatamente dois arquivos alterados, uma linha substituída em cada executor (somente `local files=(...)`), sem alteração das demais funções.

- PC: `scripts/executores/intent-executor-PC.sh`. Blob anterior `366b55981e8db5caed31d8d51613db64852edb01`; blob corrigido `1d720fc34b183e7e0badb9f8559898a41d3bfdea`. A função 9 verifica `gestao/governanca/contratos/README.md`, `gestao/governanca/contratos/INTERFACE_EXECUTORES.md`, `gestao/governanca/contratos/ARQUITETURA_ATUAL_VM.md`, `gestao/comunicacao/ai-handoff/continuidade/ESTADO_ATUAL_INTENT.md` e `gestao/comunicacao/ai-handoff/continuidade/PROMPT_RETOMADA_CHATGPT.md`.
- VM: `scripts/executores/intent-executor-VM.sh`. Blob anterior `08ddbf2537a4a794c6230d9d9c9a7ea7254d51d5`; blob corrigido `211c8c4df27eaf936b20f67bb5235424cb7f065a`. A função 9 verifica os mesmos três contratos e o documento `ESTADO_ATUAL_INTENT.md` no caminho novo.
- A interface declarada permanece `IDS=(1 2 3 4 5 6 7 8 9 10 11 12 13 14 15)`. Isso não comprova a operação real das 15 funções nos ambientes instalados.

## Evidência nova — GitHub Actions executado com sucesso

Execução CI #148, ID `35414192569`, no commit `0d2cdabb59b9eef32a2b9800998a653c19c0f10b`, em 2026-09-19: **conclusão success**. Link: https://github.com/edinhogrubert/Intent/actions/runs/35414192569 . Os jobs Frontend, Backend e Scripts Oracle concluíram com success. No job Scripts Oracle, os passos `Validar sintaxe Bash`, `Validar sintaxe e interface dos executores PC e VM` e `Validar destinos da continuidade após reorganização` concluíram com success; este último verifica os cinco caminhos novos e a ausência das referências antigas na declaração de arquivos dos executores. No backend, testes gerais, testes PostgreSQL, lint e build passaram; frontend lint e build passaram. Resultado atestado apenas para o commit indicado, não para commits posteriores ou ambientes PC/VM.

**Aceite da fase 4 (validação estática dos executores): CONCLUÍDO para o commit testado.** Não executar funções 7, 11 ou 12 nem instalar executores como consequência desta aprovação estática.

## README operacional

O `scripts/executores/README.md` foi corrigido no commit `3978aebd34c02a640d03b8ceaf890f93360e756a`, blob `71462bfb259c4b883fbabfc850d7768c742d0743`. A função PC 6 cria e verifica o bundle internamente; `/home/grubert/intent-automacao/intent-backup-git-PC.sh` é legado, não é chamado pela função 6. O mapa `gestao/governanca/contratos/MAPA_SCRIPTS_OPERACIONAIS.md` já descrevia essa condição.

## Pendências para concluir a reorganização

1. Fase 5: varredura integral da árvore vigente por referências quebradas a `contratos/`, `docs/`, `Nova pasta/` e documentos Markdown retirados da raiz; corrigir consumidores ativos, preservar menções históricas contextualizadas.
2. Fase 6: comparar SHAs de duplicatas e preservar rastreabilidade antes de excluir qualquer conteúdo; confirmar que não existem consumidores da localização antiga.
3. Fases 7–9: revisar documentação operacional, validar links relativos e auditar diff completo. A execução CI acima não equivale à auditoria global de documentação.
4. Bootstrap/instalação: `scripts/executores/baixar-e-atualizar-executores.sh` seleciona refs incluindo `INTENT_EXECUTOR_REF`, `main` e `docs/contratos-agentes`; instaladores têm padrão `main`. Não executar instaladores nem apontar o bootstrap à branch como teste documental.
5. `gestao/auditoria/MATRIZ_DEPENDENCIAS_v1PC.md` descreve levantamento anterior à migração e não é estado vigente.

**Aceite da reorganização completa: BLOQUEADO** pelas pendências das fases 5–9, não mais pela sintaxe dos executores. Nenhuma validação operacional no PC/VM, merge, release ou deploy foi realizada.
