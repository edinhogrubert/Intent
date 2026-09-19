# Gestão do Intent — índice de organização v1PC

Esta é a raiz administrativa da branch `chore/auditoria-gestao-v1-20260918`. A `main` continua sendo a fonte operacional até revisão e integração autorizadas.

## Prioridade e limites da reorganização

**O sistema ativo é a prioridade absoluta.** Preservar o funcionamento e os caminhos de `src/`, `backend/`, `deploy/`, `scripts/`, `.github/`, configurações e contratos consumidos por scripts; verificar dependências e testes antes de considerar a migração pronta.

- `archive/intentV1/`: exclusivamente acervo histórico. Não é sistema ativo, referência de implantação, fonte de restauração ou rollback.
- `Nova pasta/` (material preservado em `gestao/historico/triagem-nova-pasta/`): exclusivamente referência e objeto de estudo. Não instalar, executar ou tratar esses scripts como consumidores operacionais sem evidência nova e autorização explícita.
- Registros em `gestao/historico/` não comprovam estado vigente. A análise de duplicatas históricas não pode atrasar correções de dependências do sistema; qualquer limpeza exige verificar SHA e procedência.

## Localizações consolidadas

- `gestao/governanca/contratos/`: contratos de agentes, interfaces de executores, fluxo e registros de arquitetura do PC/VM preservados em sua estrutura original.
- `gestao/governanca/INDICE_CONTRATOS_v2PC.md`: índice de leitura com caminhos atualizados.
- `gestao/produto/`: documentação de visão e especificação do produto, incluindo `projetocompleto.md`.
- `gestao/planejamento/`: planejamento e backlog, incluindo `JIRA.md` e `ProximasFuncionalidades.md`.
- `gestao/arquitetura/`: documentação técnica descritiva.
- `gestao/operacao/`: procedimentos e manuais.
- `gestao/comunicacao/ai-handoff/`: comunicação e continuidade entre agentes.
- `gestao/historico/`: documentos históricos e material preservado exclusivamente para consulta.
- `gestao/auditoria/`: rastreabilidade e verificação da reorganização.

A raiz mantém somente componentes que exigem localização técnica, como `AGENTS.md`, `.github/`, `src/`, `backend/`, `deploy/`, `scripts/` e arquivos de configuração. Os scripts executáveis permanecem em `scripts/executores/`; nenhum instalador foi executado.

## Regra de interpretação

Cópia fiel não é validação de atualidade. Documentos com afirmações históricas, como `revisar.md`, não devem substituir o estado confirmado por código, testes e commits. `projetocompleto.md` se apresenta como especificação de produto aprovada para planejamento; isso não comprova que suas funcionalidades estejam implementadas.

## Pendências de aceite

Priorizar a correção de consumidores e links operacionais, executar a verificação integral de referências e testes, e só então concluir a classificação histórica e o inventário de duplicatas. Não integrar esta branch à `main` nem realizar deploy antes dessa validação. Consulte `gestao/auditoria/` para evidências.
