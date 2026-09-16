# Bloco 21 — Seguir Usuários / Rede Social Inicial

Estado: IMPLEMENTADO NA INTEGRAÇÃO OFICIAL
Base: mvp-1.0.19 / 7ea9d7a397b0ee2c83be3387b71af4fc08c70de7
Bloco: 21 — Seguir Usuários / Rede Social Inicial
Origem: edinhogrubert/intentNew @ c95d160
Frontend alterado: SIM
Backend alterado: SIM
Prisma alterado: NÃO
Migration criada: NÃO
Mock alterado: NÃO (nenhum mock de produto; doubles dos testes HTTP ampliados)
Contrato da API alterado: SIM (campos aditivos)
schema.prisma aplicado: NÃO
Justificativa schema.prisma: arquivo do laboratório idêntico ao oficial; hash Git 211ae16d324d12b602d334159a01dd963c7f099d em ambos. A lista de arquivos alterados do laboratório estava incorreta. Classificação B: estrutura follows já existente, sem mudança de schema.
FOLLOW_RECEIVED aplicado: SIM (reutilização da implementação oficial existente, sem alteração do enum ou do serviço de notificações)
Justificativa FOLLOW_RECEIVED: enum presente no schema e na migration 20260913000100_add_notifications; criação transacional e deduplicação existentes preservadas.
Estrutura follows já existia: SIM (schema e migration 20260905000100_add_social_follows)

## Base oficial confirmada

Antes da branch de integração, main e origin/main estavam em 7ea9d7a, working tree limpo e tag local/remota mvp-1.0.19 apontando para esse commit. A VM foi declarada validada pelo responsável; não acessamos seu banco nem executamos migrations.

## Integração e compatibilidade

Reaproveitados componente, extensão do serviço de perfil público e testes da entrega c95d160. POST/DELETE follow e GET followers/following já existiam e foram reutilizados.

GET /v1/users/:id/profile recebe a identidade autenticada e acrescenta isMe, viewerIsFollowing, stats.followersCount e stats.followingCount, contando apenas conexões com usuários ativos. O serviço social acrescenta viewerIsFollowing como alias compatível de isFollowing.

O laboratório tipava incorretamente a resposta de POST/DELETE follow como perfil público completo. A integração usa followProfile/unfollowProfile existentes, cujo retorno é ApiSocialProfile, e atualiza somente relação e contadores; preserva intents e estatísticas públicas. Isso evita quebrar o histórico ao seguir.

Deixar de seguir agora verifica alvo ativo antes de remover a relação, evitando mutação seguida de erro 404. Auto-follow, autenticação, idempotência e notificações existentes foram preservados.

Frontend: ação seguir/deixar de seguir, atualização otimista com reversão no erro, contadores, próprio perfil sem ação de seguir, listas com paginação e nova tentativa, diálogo nativo com foco modal e Escape. Respostas de listas canceladas são ignoradas; trocar userId recria o estado do componente e isola requisições antigas. Preservados os cinco cards do Bloco 20, histórico público e navegação.

## Privacidade e escopo

Consultas usam seleção pública sem email, firebaseUid ou passwordHash. Perfil público continua autenticado. Não alterados domínio de Intents, reveal, apoios, comentários, reações, schema, migrations ou mocks de produto.

Não importados prisma.ts, db-url.ts, config.ts, server.ts, MvpIntentDetail.tsx, manifests, lockfiles ou adaptações Cloud SQL do laboratório.

## Testes executados

- git diff --check: aprovado.
- npm run lint: aprovado.
- npm run build: aprovado, 1706 módulos.
- npm --prefix backend run lint: aprovado.
- cd backend && npx --no-install prisma generate --schema=prisma/schema.prisma: aprovado, Prisma Client 6.19.0.
- cd backend && npm test: 210 testes aprovados, 10 suítes.
- Chrome headless com componente real e fixtures sintéticas isoladas: follow/unfollow, histórico, navegação, rollback, paginação, Escape, retry, troca de perfil durante requisição e próprio perfil aprovados, sem erro JavaScript.

Resultado: validações automatizadas aprovadas.
Pendências: homologação visual/autenticada com usuários e PostgreSQL reais; teste de navegador usou fixtures e não certifica a VM ou aparência final.
Veredito: integração local concluída; sem push, PR, merge ou deploy.
