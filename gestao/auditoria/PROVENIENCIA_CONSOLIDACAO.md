# Proveniência da consolidação documental — branch de auditoria

Escopo: somente `chore/auditoria-gestao-v1-20260918`. Snapshot de recuperação imediatamente anterior à remoção das pastas antigas: commit `6041088650c6dde9dafadea673f0619ab3a8bc37`. Não afirma estado vigente da `main`, do PC ou da VM.

## Cópias exatas verificadas por identidade de objeto Git

- `JIRA.md` → `gestao/planejamento/JIRA.md`: blob `72dcf4aa732f7b1738c3bdd03615d03693cb805e`.
- `ProximasFuncionalidades.md` → `gestao/produto/ProximasFuncionalidades.md`: blob `eb08612969174f9c333db8548303817e470d7651`.
- `projetocompleto.md` → `gestao/produto/projetocompleto.md`: blob `e1786e802f24dac36e12dff45f9ba161e0c11d21`.
- `projatual.md` → `gestao/historico/projatual.md`: blob `3c3843d5e5f4bd32efde552d7b725f2a4201d9b9`.
- `revisar.md` → `gestao/historico/revisar.md`: blob `6e9c04fdbdc73c860768b1f99668ddc556224fbd`.
- `visaodedoisenior.md` → `gestao/historico/visaodedoisenior.md`: blob `3bdfe491f25a1d909d1dd58c3776e31ceac499d1`.
- `Nova pasta/` → `gestao/historico/triagem-nova-pasta/`: árvore Git idêntica `6245d7e122c0e9ca1c6693c80ee83cca042fb579`, incluindo nomes, modos e duplicatas internas não classificadas. Não apagar os arquivos da triagem sem novo exame individual.

## Pastas substituídas por destinos classificados

- `docs/`: árvore histórica `a7b35657b919a33e220a7adfcb29813afbb9bc68`. Seus 10 documentos na raiz foram comparados por blob Git com arquivos correspondentes em `gestao/historico/recuperacao/`, `gestao/arquitetura/`, `gestao/operacao/` e `gestao/produto/` e preservados sem alteração. A subárvore antiga `docs/ai-handoff/` é `e23244d980d834c44630726e1e077cf8a402e955`; o destino `gestao/comunicacao/ai-handoff/` preserva nomes, conteúdos e subárvores, exceto edição intencional em `continuidade/PROMPT_RETOMADA_CHATGPT.md` para marcar o snapshot do bloco 25 como histórico e atualizar o caminho de retomada. O original desse único arquivo tem blob `e4ac05128d9a0003643b54eddc46fea0c1f181f9`, recuperável no commit de snapshot acima.
- `contratos/`: árvore histórica `b68b431189c506c72ce4821a8dc43079d44f099f`; todos os 8 nomes foram conferidos em `gestao/governanca/contratos/`. Quatro blobs ficaram idênticos (`CONTRATO_AGENTES_LABORATORIO_INTEGRACAO.md`, `FLUXO_FUNCIONALIDADE.md`, `INTERFACE_EXECUTORES.md`, `MAPA_SCRIPTS_OPERACIONAIS.md`); quatro mudaram intencionalmente para atualizar caminhos/consistência (`ARQUITETURA_ATUAL_PC.md`, `ARQUITETURA_ATUAL_VM.md`, `CONTRATO_AGENTE_SENIOR_CHATGPT.md`, `README.md`). Os originais permanecem recuperáveis por Git no commit de snapshot.

A identidade de blob/árvore prova igualdade de bytes/estrutura onde declarada, não prova validade operacional, atualidade de textos históricos ou ausência de referências quebradas. A revisão dos consumidores, links e o aceite final da reorganização seguem independentes. A `main`, os executores instalados, o PC e a VM não são alterados por esta consolidação.
