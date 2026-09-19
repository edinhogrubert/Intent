# Contrato-base para handoffs de IA — Intent

O backend oficial do Intent usa **Express + Prisma + PostgreSQL** e autenticação
com **Firebase Auth**. O backend é a autoridade: a identidade de escrita vem de
`request.appUser.id`, nunca de um identificador enviado pelo cliente.

Toda consulta que retorna dados deve usar `select` explícito e uma projeção
compatível com o contrato público. Fluxos de produção não podem depender de
mocks ou `localStorage`. A autorização deve preservar as regras existentes de
`PUBLIC`, `FOLLOWERS`, `PRIVATE` e `GUARDIANS`.

Cada entrega preparada pelo Gemini deve registrar:

- contrato de dados e comportamento utilizado;
- arquivos criados ou alterados;
- riscos, limitações e decisões de escopo;
- testes executados e resultados.

O código do laboratório é uma proposta. Antes de migrar, ele deve ser comparado
com a `main` oficial e adaptado aos contratos vigentes.
