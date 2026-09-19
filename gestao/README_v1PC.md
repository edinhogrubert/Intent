# Gestão do Intent — índice de organização v1PC

Esta é a raiz administrativa da branch `chore/auditoria-gestao-v1-20260918`. A `main` continua sendo a fonte operacional até revisão e integração autorizadas.

## Localizações consolidadas

- `gestao/governanca/contratos/`: contratos de agentes, interfaces de executores, fluxo e registros de arquitetura do PC/VM preservados em sua estrutura original.
- `gestao/governanca/INDICE_CONTRATOS_v2PC.md`: índice de leitura com caminhos atualizados.
- `gestao/produto/`: documentação de visão e especificação do produto, incluindo `projetocompleto.md`.
- `gestao/planejamento/`: planejamento e backlog, incluindo `JIRA.md` e `ProximasFuncionalidades.md`.
- `gestao/arquitetura/`: documentação técnica descritiva.
- `gestao/operacao/`: procedimentos e manuais.
- `gestao/comunicacao/ai-handoff/`: comunicação e continuidade entre agentes.
- `gestao/historico/`: documentos históricos e material preservado para classificação.
- `gestao/auditoria/`: rastreabilidade e verificação da reorganização.

A raiz mantém somente componentes que exigem localização técnica, como `AGENTS.md`, `.github/`, `src/`, `backend/`, `deploy/`, `scripts/` e arquivos de configuração. Os scripts executáveis permanecem em `scripts/executores/`; nenhum instalador foi executado.

## Regra de interpretação

Cópia fiel não é validação de atualidade. Documentos com afirmações históricas, como `revisar.md`, não devem substituir o estado confirmado por código, testes e commits. `projetocompleto.md` se apresenta como especificação de produto aprovada para planejamento; isso não comprova que suas funcionalidades estejam implementadas.

## Pendências de aceite

Verificar referências antigas em todo o repositório, corrigir consumidores e links para `gestao/`, classificar individualmente material misto e confirmar o inventário integral. Não integrar esta branch à `main` nem realizar deploy antes dessa validação. Consulte `gestao/auditoria/` para evidências.
