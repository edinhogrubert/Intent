# Bloco 18 — Feed Social Vivo da Home

## Resumo Técnico

Este bloco realizou o aprimoramento da home/feed do Intent (`MvpHomeFeed.tsx`) para reforçar a experiência de uma rede social de acontecimentos reais e transparentes.

### Status
- IMPLEMENTADO
- FRONTEND-ONLY
- BACKEND NÃO ALTERADO
- PRISMA NÃO ALTERADO
- MIGRATION NÃO CRIADA
- MOCK NÃO ALTERADO
- CONTRATO DA API NÃO ALTERADO
- TESTADO LOCALMENTE
- PENDENTE DE REVISÃO
- PENDENTE DE PR/MERGE/DEPLOY

---

## Arquivos Alterados
- `src/components/MvpHomeFeed.tsx`
- `docs/ai-handoff/bloco-18-feed-social-vivo.md`

---

## Funcionalidades Implementadas

1. **Card de Intent Vivo e Social (`IntentCard`)**:
   - Destaque superior visual por status (verde para `REALIZED`, azul `#000666` para `PUBLISHED`).
   - Identificação do criador com avatar, display name, handle `@username` e data formatada de publicação.
   - Badges combinadas de status (`Realizada` ou `Em andamento`), categoria do MVP e visibilidade (`Pública`, `Seguidores`, `Privada`).
   - Título com efeito hover suave e história/acontecimento com limite de 3 linhas para leitura equilibrada.
   - Caixa de condição com barra de progresso visual em tempo real.
   - Sinais sociais reais:
     - Contador total de reações e pílula visual com detalhamento de reações (`👍 Curtir`, `❤️ Amar`, `🎉 Celebrar`).
     - Selo `"Você reagiu: 👍/❤️/🎉"` quando o usuário autenticado tiver registrado reação na Intent.
     - Selo `"Você apoiou"` quando o usuário autenticado tiver apoiado a Intent.
   - Botão de ação claro `"Ver Intent"` com ícone `ArrowRight`.

2. **Estados Vazios Acolhedores e Informativos**:
   - Feed público vazio: Mensagem acolhedora convidando o usuário a criar o primeiro acontecimento com botão `"Criar primeira Intent"`.
   - Feed seguindo vazio: Orientação para explorar perfis e botão `"Ver feed público"`.
   - Filtro de categoria sem resultados: Mensagem amigável com botão de limpeza de filtro.

3. **Linguagem do Produto e Usabilidade**:
   - Vocabulário centrado em acontecimentos, intenções, revelações protegidas e apoios reais.
   - Aprimoramento da caixa de busca (`"Buscar acontecimentos e pessoas..."`) e botões de toque com targets confortáveis no mobile.

---

## Dados Sociais Usados
- `intent.reactionCounts` (`LIKE`, `LOVE`, `CELEBRATE`, `total`)
- `intent.viewerReaction` (`LIKE` | `LOVE` | `CELEBRATE` | `null`)
- `intent.viewerHasSupported` (`boolean`)
- `intent.status` (`PUBLISHED` | `REALIZED`)
- `intent.supportCount` & `intent.supportGoal`
- `intent.guardianApprovals` & `intent.guardianApprovalGoal`
- `intent.revealAt`
- `intent.creator` (`displayName`, `username`, `avatarUrl`)
- `intent.category` & `intent.visibility`

---

## Dados Ausentes Registrados (Oportunidades Futuras)
- `commentsCount` no objeto resumido de `ApiIntent` / lista do feed (atualmente os comentários são listados por requisição dedicada por Intent). Para exibir o total exato de comentários diretamente no card do feed sem N+1 requisições, seria benéfico incluir `commentsCount: number` no retorno da listagem de Intents no backend em bloco futuro.

---

## Testes Executados
- `git diff --check`
- `npm run lint` (`tsc --noEmit`)
- `npm run build` (`vite build`)
