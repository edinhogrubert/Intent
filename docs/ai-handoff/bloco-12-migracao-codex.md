# Bloco 12 — Migração pelo Codex

## Origem e arquivos lidos

A referência veio do repositório `edinhogrubert/intentNew`, `origin/main` no
commit `95001bc` (`feat(ui): implement 3-column social home layout`). Foram
lidos e comparados:

- laboratório: `src/components/MvpHomeFeed.tsx` e `src/App.tsx`;
- laboratório: `docs/ai-handoff/bloco-12-home-social-3-colunas.md`, recuperado
  do commit remoto porque não estava nos checkouts locais;
- oficial: `src/components/MvpHomeFeed.tsx` e `src/App.tsx` na base
  `4d21683` (`mvp-1.0.10`).

## Arquivos oficiais alterados

- `src/components/MvpHomeFeed.tsx`;
- `docs/ai-handoff/GEMINI_BACKEND_INTENT.md`;
- `docs/ai-handoff/bloco-12-home-social-3-colunas.md`;
- `docs/ai-handoff/bloco-12-migracao-codex.md`.

`src/App.tsx` foi comparado, mas permaneceu intacto para preservar o shell real
de navegação, notificações, badge, modal com filtros e atualização de perfil.

## O que foi migrado

- layout responsivo em três colunas no desktop;
- resumo de perfil com `currentUser` e métricas de `getSocialProfile`;
- estado neutro (`—`) quando as métricas não carregam;
- compositor rápido que abre o `CreationWizard` real;
- cards com categoria, visibilidade e condição real para apoio, data e
  guardiões;
- caixa visual de revelação protegida;
- ação de comentários que abre o detalhe existente;
- coluna de descoberta com as Intents mais apoiadas no feed carregado;
- categorias reais que filtram somente os itens já carregados;
- composição de uma coluna em telas menores.

## O que precisou de adaptação

- a busca oficial por API foi preservada; a filtragem textual local do
  laboratório foi descartada;
- “Em alta” foi renomeado para “Mais apoiadas neste feed”, pois o dado representa
  somente a página carregada e não uma tendência global;
- falha ao carregar o perfil não inventa métricas iguais a zero;
- condições `DATE` e `GUARDIANS` usam seus próprios dados, sem assumir uma meta
  de apoios;
- o botão de comentários não mostra contagem porque `ApiIntent` não fornece
  esse total.

## O que foi descartado

- apoio otimista direto no card: o contrato atual do feed não informa de forma
  confiável `viewerHasSupported`; apoio continua no detalhe;
- indicador fixo de notificação do laboratório;
- `IS_MOCK_MODE`, mocks e qualquer fallback de produção;
- propriedades incompatíveis de `NotificationsModal` e `MvpSocialProfile`;
- duplicação do feed em um carrossel de destaque;
- compartilhamento sem ação real e contagem simulada de comentários;
- alterações cosméticas amplas no shell do `App.tsx`.

## Dados reais usados

- `currentUser` da sessão Firebase sincronizada;
- `getSocialProfile()` para métricas do próprio usuário;
- `listPublicIntents(scope)` para “Para você” e “Seguindo”;
- `searchIntentsAndUsers(query)` para busca real;
- campos públicos de `ApiIntent` para cards, condições e descoberta.

## Backend e API

Backend e API não foram alterados. Não há endpoint ou migration nova. Firebase,
Docker, deploy, portas e autenticação também permanecem intactos.

## Riscos e pendências

- categorias filtram apenas as Intents já carregadas, pois a API não oferece
  filtro por categoria;
- “Mais apoiadas neste feed” considera somente os itens carregados;
- apoio permanece disponível no detalhe para evitar estado incorreto no card;
- não existe contagem de comentários no contrato do feed.

## Como testar manualmente

1. Autenticar e abrir a Home em uma janela com pelo menos 1024 px.
2. Confirmar perfil real à esquerda, feed ao centro e descoberta à direita.
3. Alternar entre **Para você** e **Seguindo**.
4. Buscar uma Intent e uma pessoa, abrir cada resultado e voltar à Home.
5. Selecionar uma categoria e limpar o filtro.
6. Abrir uma Intent pela lista de mais apoiadas e pelo card central.
7. Abrir criação pelo compositor e cancelar para retornar.
8. Abrir um card e validar apoio, guardiões e comentários no detalhe.
9. Conferir sino, badge, modal e filtros de notificações no cabeçalho.
10. Reduzir a janela para tablet e celular e confirmar a composição em uma
    coluna, sem rolagem horizontal da página.
