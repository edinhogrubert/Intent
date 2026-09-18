# Intent — Estado Atual Oficial

Atualizado em: 2026-09-17

## 1. Projeto

- Projeto: Intent
- Repositório oficial: `edinhogrubert/Intent`
- Branch oficial: `main`
- Laboratório: `intentNew`
- VM oficial: existe, mas não deve ser alterada sem autorização explícita.

## 2. Release oficial vigente

- Release operacional vigente antes do Bloco 25: `mvp-1.0.23`
- Próxima release planejada após Bloco 25: `mvp-1.0.24`
- Release `mvp-1.0.24` ainda NÃO foi criada.

## 3. Bloco em andamento

Bloco atual:

- Bloco 25 — Perfis sociais, links compartilháveis e atividade pública.

Partes do Bloco 25:

- 25A — Links compartilháveis: implementado e integrado no PR #26.
- 25B — Edição completa de perfil social: implementado e integrado no PR #26.
- 25C — Filtros da atividade pública: integrado no PR #26, mas BLOQUEADO por falha de race condition.

## 4. PR atual

- PR: `#26`
- URL: `https://github.com/edinhogrubert/Intent/pull/26`
- Branch: `feat/shareable-links`
- Último commit de código conhecido com bloqueio: `a02beb970e42eddd8b44edff0960f24ea87d857e`
- Estado: aberto
- Merge: NÃO realizado
- Deploy: NÃO realizado
- Release/tag: NÃO criadas

Observação: commits posteriores de documentação podem existir sem corrigir o bloqueio de código. Para validar o estado técnico, verificar se houve commit específico corrigindo o `PublicUserActivity.tsx` após `a02beb970e42eddd8b44edff0960f24ea87d857e`.

## 5. Bloqueio atual

O PR #26 está BLOQUEADO.

Arquivo envolvido:

- `src/components/PublicUserActivity.tsx`

Problema:

- Uma resposta pendente de “Carregar mais” continua sendo aplicada após trocar o filtro.
- Eventos do filtro anterior são adicionados à nova lista.
- O cursor antigo pode sobrescrever o cursor do filtro atual.

Impacto:

- Quebra o requisito principal do Bloco 25C: isolamento de lista e cursor entre filtros diferentes.

Estado correto:

- Não fazer merge do PR #26.
- Não criar release.
- Não fazer deploy.
- Corrigir somente o 25C.
- Revalidar depois.

## 6. Validações já executadas

Testes específicos incluídos na suíte completa:

- Links: `27/27` PASS
- Edição: `26/26` PASS
- Atividade: `20/20` PASS

Validação funcional:

### 25A

- Parsing aprovado.
- Navegador preservou URLs e AuthGate.
- Abertura do recurso após login ainda pendente.

### 25B

- Edição e proteção de campos passaram nos testes HTTP/schema.
- Interação autenticada no navegador ainda pendente.

### 25C

- “Todos”, “Criações” e “Apoios” passaram no serviço com PostgreSQL real.
- Paginação de Todos/Criações passou.
- Troca de filtro com paginação pendente falhou.

## 7. Próximo passo obrigatório

Corrigir race condition no `PublicUserActivity.tsx`.

A correção deve garantir:

1. Ao trocar filtro, requisições pendentes anteriores são invalidadas.
2. Resposta de “Carregar mais” só aplica resultado se o filtro ativo ainda for o mesmo.
3. Resposta antiga não pode adicionar itens, alterar cursor, alterar loading ou sobrescrever erro do filtro atual.
4. Não alterar Prisma.
5. Não criar migration.
6. Não alterar contrato da API sem necessidade comprovada.
7. Não fazer merge/tag/release/deploy/VM.

## 8. Próximo bloco planejado

Após fechar o Bloco 25:

- Bloco 26 proposto: Descoberta Social e Busca.

Ideia inicial:

- 26A — Busca global.
- 26B — Tela Explorar/Descobrir.
- 26C — Sugestões sociais simples.

Estado do Bloco 26:

- Proposta apenas.
- Ainda não iniciado.
- Não existe implementação oficial.
