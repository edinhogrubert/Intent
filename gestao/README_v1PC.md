# Gestão do Intent — índice de organização v1PC

Esta é a raiz administrativa da branch `chore/auditoria-gestao-v1-20260918`. A `main` continua sendo a fonte operacional até revisão e integração autorizadas.

## Prioridade e limites da reorganização

**O sistema ativo é a prioridade absoluta.** Preservar o funcionamento e os caminhos de `src/`, `backend/`, `deploy/`, `scripts/`, `.github/`, configurações e contratos consumidos por scripts; verificar dependências e testes antes de considerar a migração pronta.

- `archive/intentV1/`: exclusivamente acervo histórico. Não é sistema ativo, referência de implantação, fonte de restauração ou rollback.
- `Nova pasta/` (material preservado em `gestao/historico/triagem-nova-pasta/`): exclusivamente referência e objeto de estudo. Não instalar, executar ou tratar esses scripts como consumidores operacionais sem evidência nova e autorização explícita.
- Registros em `gestao/historico/` não comprovam estado vigente. Duplicatas e links internos desses acervos não bloqueiam a reorganização; não realizar exclusão ou execução desses materiais como parte do aceite.

## Localizações consolidadas

- `gestao/governanca/contratos/`: contratos de agentes, interfaces de executores, fluxo e registros de arquitetura do PC/VM.
- `gestao/governanca/INDICE_CONTRATOS_v2PC.md`: índice de leitura com caminhos atualizados.
- `gestao/produto/`: documentação de visão e especificação do produto, incluindo `projetocompleto.md` e `ProximasFuncionalidades.md`.
- `gestao/planejamento/`: planejamento e backlog, incluindo `JIRA.md`.
- `gestao/arquitetura/`: documentação técnica descritiva.
- `gestao/operacao/`: procedimentos e manuais.
- `gestao/comunicacao/ai-handoff/`: comunicação e continuidade entre agentes.
- `gestao/historico/`: documentos históricos e material preservado exclusivamente para consulta.
- `gestao/auditoria/`: rastreabilidade e verificação da reorganização.

A raiz mantém componentes que exigem localização técnica, como `AGENTS.md`, `.github/`, `src/`, `backend/`, `deploy/`, `scripts/` e arquivos de configuração. Os scripts executáveis permanecem em `scripts/executores/`; nenhum instalador foi executado.

## Regra de interpretação

Cópia fiel não é validação de atualidade. Documentos com afirmações históricas, como `revisar.md`, não devem substituir o estado confirmado por código, testes e commits. `projetocompleto.md` é especificação de produto para planejamento; isso não comprova que suas funcionalidades estejam implementadas.

## Critérios objetivos de aceite

1. Comparar a branch à `main` e confirmar que os arquivos de execução em `src/`, `backend/` e `deploy/` estão preservados e que alterações em `scripts/` e `.github/` são compreendidas.
2. Verificar caminhos efetivamente consumidos pelos executores e CI; conferir testes no commit final.
3. Conferir acessibilidade dos índices e documentos operacionais necessários. Links exclusivamente históricos ou duplicatas em acervos de estudo não impedem o aceite e não exigem limpeza.
4. Entregar o diff e os limites de validação ao responsável; nenhum merge, instalação, release ou deploy sem autorização explícita.

Consulte `gestao/auditoria/` para evidências.
