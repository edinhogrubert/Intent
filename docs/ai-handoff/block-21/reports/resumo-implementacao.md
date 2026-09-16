# Resumo da integração oficial — Bloco 21

Base: mvp-1.0.19 / 7ea9d7a. Entrega reaproveitada: intentNew / c95d160.

## Backend

Reutilizadas rotas de follow/unfollow e listas autenticadas, seleção pública, paginação, estrutura Follow e notificação FOLLOW_RECEIVED já oficiais. Perfil público recebe a identidade autenticada para isMe/viewerIsFollowing e contadores de conexões ativas. Alias viewerIsFollowing adicionado ao perfil social sem remover isFollowing. Unfollow valida alvo antes de mutação.

## Frontend

Reutilizada a interface do laboratório e os clientes de API existentes. A resposta social de follow atualiza somente contadores e relação no perfil público, preservando histórico e cinco cards oficiais. Próprio perfil não oferece follow. Modal nativo traz paginação, retry e Escape; estados e respostas antigas são isolados ao trocar perfil.

## Exclusões

Schema do laboratório é idêntico ao oficial; sua inclusão na lista original de alterações era incorreta. Nenhuma migration ou configuração de infraestrutura necessária. Não aplicados ajustes Cloud SQL ou mudanças em MvpIntentDetail.

## Verificação

210 testes backend aprovados, lint frontend/backend, build, geração Prisma e verificação funcional do componente em Chrome aprovados. Detalhes e limitações em validacoes.md.
