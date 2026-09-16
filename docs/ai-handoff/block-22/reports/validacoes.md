# Validações oficiais — Bloco 22

- Base: main e origin/main em a075ec5; tag mvp-1.0.20 aponta para o mesmo commit; working tree limpo antes da branch.
- git diff --check: aprovado.
- npm run lint: aprovado.
- npm --prefix backend run lint: aprovado.
- npm run build: aprovado, 1706 módulos.
- cd backend && npx --no-install prisma generate --schema=prisma/schema.prisma: aprovado, Prisma Client 6.19.0. Executado a partir do backend para usar a versão instalada, sobre o mesmo schema solicitado.
- npm --prefix backend test: 214 testes aprovados, 10 suítes; social-http com 100 testes.
- node /tmp/block22-ui-check.cjs: aprovado; Chrome com componente real, CSS compilado e fixtures sintéticas isoladas. Verificados os quatro valores, seções, follow/unfollow, histórico, Abrir Intent, Voltar, rollback em erro, listas paginadas, Escape, retry e troca de perfil durante requisição. Nenhum erro JavaScript. Primeira execução identificou controles do cabeçalho sem ação; controles oficiais restaurados e teste repetido com sucesso.

## Segurança e regressões

Testes HTTP cobrem perfil vazio, valores dados versus recebidos, followersCount/followingCount/viewerIsFollowing, seleção sem email/firebaseUid/passwordHash e filtros agregados excluindo Intents privadas/FOLLOWERS/não publicadas e autores inativos. Count de Intents com OR é verificado para evitar soma por tipo de participação. Nenhuma mutação de domínio ocorre ao ler perfil.

app.ts, rotas, serviço social, Prisma e infraestrutura sem alterações. Delta do laboratório para app.ts vazio; arquivo excluído da integração.

## Limitações

Sem PostgreSQL real, teste de carga ou login real na VM. Os testes de agregação verificam os contratos de consulta Prisma; o navegador usa fixtures e não certifica os dados da produção. Nenhum reset, seed, migration, deploy ou comando destrutivo executado.
