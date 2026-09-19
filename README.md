# Intent

Este é o ponto de entrada do repositório. A organização administrativa em `gestao/` está em revisão na branch `chore/auditoria-gestao-v1-20260918`; a branch `main` permanece a referência operacional até integração autorizada. A existência de um documento não comprova que seu conteúdo descreva o estado técnico vigente.

## Código e operação

- Frontend: [`src/`](src/)
- Backend: [`backend/`](backend/)
- Implantação Oracle: [`deploy/oracle/`](deploy/oracle/)
- Scripts e executores: [`scripts/`](scripts/) e [`scripts/executores/`](scripts/executores/)
- Integração contínua: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)
- Orientações de agentes na raiz: [`AGENTS.md`](AGENTS.md)

Os scripts executáveis e arquivos de configuração permanecem em seus caminhos técnicos. Não execute instaladores, funções de sincronização ou deploy apenas para validar a reorganização documental.

## Gestão e documentação

Comece pelo [índice de gestão](gestao/README_v1PC.md). Consulte o [índice de contratos](gestao/governanca/INDICE_CONTRATOS_v2PC.md), os [documentos de continuidade](gestao/comunicacao/ai-handoff/continuidade/) e as [evidências de auditoria](gestao/auditoria/).

Documentos em `gestao/historico/` são registros preservados, não instruções operacionais atuais. Para declarar branch, commit, release, PR ou estado de produção, confira evidências atuais antes de reutilizar qualquer handoff.

## Estado desta reorganização

A migração ainda não está aprovada para integração: faltam concluir a verificação de referências e dependências, a validação dos executores e a auditoria final. Alterações nesta branch não atualizam automaticamente o PC, a VM ou a `main`.
