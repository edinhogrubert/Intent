# Handoff de diff — Intent DRAFT/Publicação

## Objetivo

Entregar ao Agente de Integração Oficial o diff da implementação de `DRAFT` e publicação explícita para leitura, revisão e aplicação no repositório oficial. Este pacote não autoriza merge, deploy, alteração da VM ou aplicação automática.

## Origem do diff

- Repositório: `edinhogrubert/Intent`
- Base comparada: `main` em `ad4482607c994653a8572cc6f4139d855ab55694`
- Implementação local comparada: `feat/intent-draft-publish`
- SHA da implementação local: `e9748782dc47f919337f8d08e6531c9a93149d04`
- Diff completo: `intent-draft-publish.patch`
- Commit do laboratório auditado: `24d2cc10faf77000cda626a216b176f91ec57c23`

## Conteúdo do diff

O patch contém 16 arquivos, com 849 linhas adicionadas e 21 removidas:

- migration Prisma para permitir `published_at` nulo;
- schema e validação de criação com `DRAFT`/`PUBLISHED`;
- rota de publicação idempotente;
- isolamento de rascunhos no serviço de Intent;
- bloqueio de apoio, comentário, reação e acompanhamento em rascunho;
- evento de histórico `INTENT_PUBLISHED`;
- wizard e detalhe de Intent no frontend;
- testes dedicados e ajustes de testes existentes;
- handoff arquitetural do bloco.

## Decisões preservadas

1. O fluxo padrão continua criando diretamente como `PUBLISHED`.
2. `DRAFT` é uma opção explícita, não uma etapa obrigatória.
3. Intents antigas não recebem evento retroativo de rascunho.
4. Publicação direta registra somente `INTENT_CREATED`; `INTENT_PUBLISHED` representa uma transição real de `DRAFT` para `PUBLISHED`.
5. Alterações não relacionadas do laboratório, especialmente em atividade pública, foram excluídas do diff.

## Verificações já executadas

- Backend: 20 arquivos, 344 testes aprovados.
- Backend lint/build: aprovados.
- Frontend lint/build: aprovados.
- PostgreSQL real com a migration: ainda pendente.

## Instrução para o Codex

Leia este arquivo e `intent-draft-publish.patch`. Compare o patch novamente contra a `main` atual antes de aplicar qualquer parte. Adapte o código aos contratos vigentes do repositório oficial, execute a suíte normal e o teste PostgreSQL real, e somente depois prepare PR/revisão. Não faça merge, deploy, alteração da VM ou mudança de release sem autorização explícita.

## Estado de publicação

O branch remoto não foi publicado porque a sessão atual não possui autenticação GitHub para `git push`. Este pacote é a transferência local do diff; o SHA acima é confirmado apenas localmente.
