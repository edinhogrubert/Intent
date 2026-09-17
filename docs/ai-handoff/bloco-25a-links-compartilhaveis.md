# Bloco 25A — Integração oficial de links compartilháveis

Estado: INTEGRADO PARA REVISÃO. Somente 25A; sem push, PR, merge, tag, release, deploy ou acesso à VM.

## Base e transferência

- Oficial: `edinhogrubert/Intent`, `/home/grubert/Projetos/Intent-local`.
- Origem local: main limpa, igual a origin/main, `4cbdc3ad5b3b6e5e699123f7e0389f98c4f4da6f`, release `mvp-1.0.23`.
- Branch: `feat/shareable-links`.
- Laboratório: `edinhogrubert/intentNew/main`, `a0c2bbcbd9301acf0c255efbfb9880c77ae6ec71`, confirmado por fetch e ancestralidade no remoto obtido.
- O código já estava no pai `205c184`; a0c2bbc publica os documentos. Foi examinada a árvore completa da entrega, não apenas seu diff imediato.
- Commit local: commit que adiciona este handoff, mensagem `feat: integrate shareable profile and intent links`; hash no relatório final.

## Material lido e comparado

Documentos do laboratório:
1. `docs/ai-handoff/bloco-25a-links-compartilhaveis.md`
2. `docs/ai-handoff/block-25a/reports/resumo-implementacao.md`
3. `docs/ai-handoff/block-25a/reports/validacoes.md`
4. `docs/ai-handoff/block-25a/diff/arquivos-alterados.md`

Os sete arquivos de código usados como referência correspondem aos sete arquivos abaixo. App, perfis, feed e detalhe foram comparados com o oficial; não houve substituição integral desses arquivos.

## Arquivos oficiais alterados/criados

- `src/utils/shareLink.ts` — novo, adaptado do laboratório.
- `backend/tests/share-link.test.ts` — novo, testes de utilitário frontend no runner existente.
- `src/App.tsx` — inicialização por URL, navegação e popstate.
- `src/components/PublicUserProfile.tsx` — compartilhar perfil público.
- `src/components/MvpSocialProfile.tsx` — compartilhar URL pública, preservando a edição e conexões já existentes.
- `src/components/MvpIntentDetail.tsx` — compartilhar Intent, sem modificar layout/regras do detalhe.
- `src/components/MvpHomeFeed.tsx` — compartilhar card sem disparar navegação.
- `docs/ai-handoff/bloco-25a-links-compartilhaveis.md` — este relatório oficial.

## Adaptações e descartes

- URLs geradas: `/?user=<uuid>` e `/?intent=<uuid>`, com origem atual, sem parâmetros/hash herdados e com UUID validado/normalizado. Mantidos aliases query do laboratório para leitura.
- Paths `/user/:id` e `/intent/:id` descartados: suporte não foi certificado no servidor oficial e não é necessário para query links. Os dois testes do laboratório que afirmavam suporte foram adaptados para documentar rejeição. Não houve alteração de servidor/reverse proxy.
- Histórico distingue `?view=create`, `?view=mine` e perfil social interno `?user=<uuid>&view=profile`. O link compartilhado de perfil sempre usa apenas `?user=`, abrindo o perfil público. O laboratório confundia telas sem URL distinta ao voltar/avançar.
- Comparação do histórico inclui hash, evitando entradas duplicadas. Popstate apenas lê e aplica destino, sem pushState em loop.
- O destino inicial é lido uma vez; estado do App permanece montado enquanto AuthGate é exibido. Login apenas estabelece a sessão e não redefine a tela para início. Popstate também atualiza o destino durante o login. Não se reaplica uma referência inicial obsoleta após logout/reautenticação, como podia ocorrer no laboratório. Logout explícito navega para início. AuthGate, Firebase, sessão e autorização não foram reimplementados.
- Clipboard usa API nativa e fallback do laboratório. Falha é informada na UI; fallback não garante sucesso em todo navegador. Elemento temporário e foco são restaurados em finally, inclusive em erro; timers têm limpeza.
- Descartadas reformatação integral do App, compactação/redesign do detalhe e regressões laboratoriais de feed/perfil. Preservados histórico de atividade, conexões, seguir, edição anterior, notificações, criação, apoio, reações, comentários, guardiões e escopos de feed.
- Teste importa dinamicamente o utilitário frontend pelo runner existente para não ampliar rootDir nem mudar o build do backend.

## Segurança e contratos

Backend de domínio, Prisma, migrations, API, Firebase, mock frontend e manifestos de release intactos. Não foram adicionados dados simulados/localStorage ao fluxo de produção. UUID no link é somente um identificador, nunca autorização.

Detalhe e perfil continuam consumindo serviços reais existentes. PUBLIC/FOLLOWERS/PRIVATE/GUARDIANS permanecem sob as regras oficiais do backend. Não há conteúdo de reveal/credenciais no link. Nenhuma operação de domínio é disparada pelo compartilhamento.

## Testes e resultados

- `npm --prefix backend test`: 264/264 PASS, 12 arquivos; 237 anteriores preservados + 27 testes de links.
- `npm run lint`: PASS.
- `npm run build`: PASS.
- `npm --prefix backend run lint`: PASS.
- `npm --prefix backend run build`: PASS.
- `TEST_DATABASE_URL=<banco descartável> npm --prefix backend run test:postgres`: 39/39 PASS em PostgreSQL 16 local efêmero, incluindo regras de acesso e domínio existentes. Container em tmpfs com porta aleatória somente em 127.0.0.1, removido após os testes. Sem dados de produção.
- `git diff --check`: PASS.

A primeira execução encontrou apenas dois testes laboratoriais que ainda esperavam path aliases; foram adequados à decisão de suportar query links. Na execução final não há testes quebrados/ignorados. O número 217 no handoff do laboratório não é a base oficial: o oficial possui as regressões de blocos anteriores que permaneceram intactas.

Os testes adicionais cobrem URL canônica, UUID inválido, histórico sem duplicação com hash, reconstrução das seis telas, replaceState, limpeza de destino, clipboard nativo e fallback com sucesso, recusa e exceção. Testes de histórico usam uma implementação simulada da API do navegador e não equivalem a E2E autenticado.

## Matriz funcional e limitações

| Cenário | Evidência |
| --- | --- |
| Gerar link de perfil | PASS unitário |
| Gerar link de Intent | PASS unitário |
| Parse de ?user e ?intent | PASS unitário |
| Rejeitar UUID inválido | PASS unitário |
| URLs de navegação interna / histórico | PASS unitário; callbacks do App revisados |
| URL direta após reload, antes de login | Observado no navegador local para perfil e Intent; AuthGate preservado |
| Destino após login | Preservação verificada no código; E2E autenticado PENDENTE |
| Autorização do backend | Código intacto, regressões HTTP e PostgreSQL PASS |
| Clipboard real e apresentação dos botões autenticados | PENDENTE manual; lógica/fallback testados com simulação |

A sessão disponível no navegador local estava desconectada. Não foi efetuado login, criado usuário ou alegado teste visual completo. O handoff do laboratório listava cenários como aprovados apesar de declarar ausência de navegador; esses resultados não foram aceitos como evidência visual.

## Roteiro manual e riscos

1. Com sessão autenticada, copiar links de perfil, card e detalhe; abrir em outra aba e recarregar.
2. Abrir link sem sessão, concluir login e conferir o mesmo destino. Voltar/avançar enquanto o AuthGate está aberto também deve preservar a URL escolhida.
3. Navegar início → criar → minhas Intents → perfil social → perfil público → detalhe; usar voltar/avançar e conferir tela/URL.
4. Conferir notificações, atividade pública, conexões, apoio, reações e comentários anteriores.
5. Conferir Intent PRIVATE/FOLLOWERS sem vínculo e GUARDIANS com vínculo conforme regras existentes; conferir erro para UUID inexistente.
6. Verificar clipboard nativo, recusa e feedback de falha em navegador real, incluindo mobile.

Pendente homologação autenticada. Query links pressupõem a raiz atual do app, conforme instalação existente; não se declara suporte a hospedagem futura em subdiretório. O fallback execCommand depende das permissões do navegador. Nenhuma dessas limitações exige mudança de autorização/migration/deploy para integrar o código.

Veredito: integrado para revisão; branch local commitada, sem publicação e sem avanço para 25B.
