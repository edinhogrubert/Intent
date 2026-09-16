# Validações oficiais — Bloco 23

Base confirmada antes da branch: main, origin/main e tag mvp-1.0.21 em ee06018, árvore limpa.

- git diff --check: aprovado.
- npm run lint: aprovado.
- npm --prefix backend run lint: aprovado.
- npm run build: aprovado, 1706 módulos.
- cd backend && npx --no-install prisma generate --schema=prisma/schema.prisma: aprovado, Prisma Client 6.19.0 instalado no backend, sem alterar banco.
- npm --prefix backend test: 217 testes aprovados em 10 suítes; social-http com 103 testes. Expectativa antiga de paginação atualizada para os campos sociais aditivos.
- node /tmp/block23-ui-check.cjs: Chrome com componente e CSS reais, fixtures isoladas; Todos padrão, alternância/loading, resposta antiga ignorada, reações, clique no autor, abrir Intent, paginação, vazio, erro e retry aprovados; nenhum erro JS.

## Cobertura e limites

Filtros Prisma verificados: PUBLIC, status publicados/realizados, autor ativo e vínculo do visitante; excluem privados/FOLLOWERS e não seguidos. Testes HTTP exercitam autenticação, seleção pública, contadores/reação/apoio e paginação. Testes de service validam cursor, take e ordenação. Nenhuma consulta social adicional para lista vazia.

Testes usam doubles de persistência; não certificam o resultado em PostgreSQL real nem custo em produção. Verificação Chrome usou fixtures, não login ou dados reais. Sem comandos destrutivos, migrations ou deploy.
