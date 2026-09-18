# Bloco 25B — Integração oficial de edição completa do perfil social

Estado: INTEGRADO PARA REVISÃO no PR #26. Sem merge, tag, alteração de release, deploy ou alteração de VM.

## Base

- Repositório oficial: `edinhogrubert/Intent`.
- Branch oficial de trabalho: `feat/shareable-links`.
- PR oficial: `#26`.
- 25A já estava integrado no PR #26.
- Origem de laboratório: `edinhogrubert/intentNew/main`.
- Handoff de origem: `docs/ai-handoff/bloco-25b-edicao-perfil.md` e pasta `docs/ai-handoff/block-25b/`.

## Escopo integrado

- Melhoria do modal de edição de perfil (`EditProfileModal`) com preview de avatar, galeria de avatares, remoção de avatar, validações client-side de nome, bio e URL de avatar, Escape para fechar e bloqueio de duplo clique durante envio.
- Edição do próprio perfil a partir da visualização pública quando o usuário abre o próprio perfil, preservando o componente oficial `PublicUserProfile` e evitando sobrescrita ampla do arquivo.
- Sincronização de `currentUser` após salvar e recarregamento do perfil público exibido por meio de chave controlada no `App`.
- Nova suíte de testes HTTP e de schema para `PATCH /v1/users/me`.

## Adaptações oficiais

- O laboratório alterava diretamente `PublicUserProfile.tsx`. Na integração oficial, esse arquivo foi preservado porque a versão oficial já continha adaptações importantes da 25A, tratamento de falha de clipboard, wrapper por `key`, retry/modal e serviços oficiais `followProfile`/`unfollowProfile`.
- A ação de editar o próprio perfil público foi integrada no `App.tsx` como controle externo seguro quando `selectedProfileId === currentUser.id`, mantendo o comportamento oficial do perfil público e evitando regressões.
- O endpoint existente `PATCH /v1/users/me` foi mantido. Não houve alteração de backend de domínio, Prisma, migrations ou contrato de API.

## Arquivos alterados/criados

- `src/components/EditProfileModal.tsx`
- `src/App.tsx`
- `backend/tests/profile-editing.test.ts`
- `docs/ai-handoff/bloco-25b-edicao-perfil.md`

## Validação

- Testes do laboratório informados: backend 243/243 PASS, nova suíte 26/26 PASS, typecheck/build PASS.
- Nesta integração feita diretamente pelo GitHub, não houve execução local de testes pelo assistente. A validação pendente deve ser feita por CI, ambiente local ou agente executor antes do merge final do Bloco 25 completo.

## Limites preservados

- 25C não foi iniciado.
- Nenhuma migration foi criada.
- Prisma não foi alterado.
- Release, tag, deploy e VM não foram alterados.
