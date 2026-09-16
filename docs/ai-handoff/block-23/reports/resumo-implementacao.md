# Resumo oficial — Bloco 23

Base mvp-1.0.21 / ee06018; laboratório ae47824.

Reaproveitados alias all/public e textos da Home. Serviço oficial following já existia e foi adaptado para somente Intents PUBLIC de criadores ativos seguidos, conforme requisito. Projeção social acrescentada por lote de IDs da página, preservando paginação e evitando consultas por item. Todos permanece inalterado.

Interface Todos/Seguindo preserva cards, navegação, loading, erro/retry e vazio. Respostas antigas são invalidadas também ao trocar usuário e desmontar.

Contrato ampliado, sem remoção de campos; atenção à redução intencional do filtro following, que antes incluía FOLLOWERS. Rotas de detalhe e regras de domínio não alteradas. Sem schema, migration, infraestrutura ou dependências novas. Risco baixo, observar volume real.
