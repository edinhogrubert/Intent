# Handoff executável — listas pessoais reutilizáveis

Status: **especificação e desenho propostos, NÃO implementados, NÃO testados e NÃO implantados**. Este documento é uma peça de comunicação para o Agente de Implementação de Laboratório; não é código de produção nem altera o contrato vigente. Conferir o HEAD de `main` antes de trabalhar. Referência verificada antes desta escrita: merge do Bloco 36 `917369ce29cb8142931093730f905a6294573443`.

## Contrato de produto aprovado

Listas são privadas e pertencem ao usuário; servem somente como atalhos para preencher seleção de pessoas em uma Intent comum. Exemplos: Futsal, Vôlei, Família, Trabalho, clientes do salão. Criador pode criar, renomear, consultar, editar membros e excluir listas próprias; ao criar uma Intent, seleciona uma ou várias listas, revisa, remove e acrescenta participantes individuais, deduplica, e confirma. Nenhuma lista possui feed, perfil público, publicação, regras de aprovação, evento social ou efeito próprio sobre apoios/reações/aprovações. Alterações ou exclusão da lista depois da publicação não podem modificar a Intent existente nem a sua História. Não implementar as políticas futuras de encerramento dos exemplos futsal/salão neste trabalho.

## Evidências do código verificadas

- `backend/prisma/schema.prisma` define `User`, `Intent` com `guardianIds` e `guardianApprovals` em JSON, `DomainEvent` e `IntentWatch`; ainda não define modelo de lista pessoal. Não presumir ausência de implementações não consultadas.
- `backend/src/domain/intent-schemas.ts` valida `guardianIds` como UUIDs, no máximo 20; exige guardiões e quórum em `GUARDIANS`, rejeita duplicados; criação é `.strict()`. Isso significa que **não enviar IDs de lista diretamente ao endpoint de criação** sem contrato explícito: a lista deve preencher os campos existentes no frontend, com validação definitiva no backend. Para outros tipos de audiência/destinatários, auditar capacidades reais; não inventar papéis novos neste bloco.
- `backend/src/services/intent-service.ts` possui `requireIntentViewAccess`; histórico do Bloco 36 usa `domain_events` e não deve depender das listas.

## Desenho técnico proposto — validar no laboratório antes de codificar

Persistência sugerida: entidade `PersonalContactList` com `id` UUID, `ownerId` FK User, `name` trim com limite razoável, `createdAt`, `updatedAt`; entidade de associação `PersonalContactListMember` com `listId`, `userId`, `createdAt`, índice/unique composto (`listId`, `userId`), FKs e exclusão segura do vínculo ao excluir a lista. Escolher política de exclusão explícita compatível com as convenções Prisma existentes, sem cascata para usuários ou Intents. Garantir titularidade e unicidade do nome por proprietário de forma coerente com normalização/case (não presumir `citext` nem índice funcional sem necessidade). Somente usuários registrados, ativos e selecionáveis conforme regra vigente; não criar contatos externos por telefone/e-mail nem compartilhar listas. Escopo máximo de membros deve respeitar o destino selecionado; como `guardianIds` tem limite 20, validar e tratar grupos maiores antes de confirmar, sem truncamento silencioso.

API sugerida, adaptável aos padrões reais: endpoints autenticados de listar/criar/editar/excluir listas próprias e adicionar/remover membros. Resolver IDs somente no contexto de titularidade; para lista inexistente ou alheia, retornar erro sem revelar existência; não aceitar `ownerId` do cliente; validar UUIDs, limites, nomes, duplicados e concorrência. A associação deve ser idempotente; remoção de membro também. Paginação se necessária; não devolver e-mail, firebaseUid ou dados sensíveis desnecessários. Membros suspensos/inacessíveis devem ser tratados de forma segura na seleção e novamente validados no fluxo oficial da criação.

Frontend sugerido: gestão acessível de listas pessoais, seletor na etapa existente de guardiões, importação de várias listas com união por ID, estado de seleção editável sem mutação da lista, revisão explícita antes de publicar, mensagens para lista vazia/inválida e opção de seleção individual preservada. Não criar fluxo de convite/social separado. Se a UX existente não oferecer destinatários independentes de guardiões, limitar o MVP ao preenchimento de guardiões; documentar destinatários como extensão futura sem alterar autorização.

Snapshot: seleção resultante deve ser enviada como os **UUIDs individuais existentes** e persistida dentro da Intent pelo fluxo atual. Não gravar `groupId` obrigatório em Intent/DomainEvent/history; renomear, editar, excluir lista ou mudar status de um membro não reescreve `guardianIds` nem altera aprovações já concedidas. Mudanças de status de usuário continuam sujeitas às políticas de segurança do backend; snapshot não significa autorização eterna.

## Proibições e critérios

Não ler `archive/` ou `Nova pasta/`. Não implementar prazo, mensagem alternativa, reservas de brindes, novos destinatários, motor de condição, timeline social, notificações ou Firebase. Não usar listas para registrar confirmação, pagamento ou entrega. Nenhum acesso entre contas. Não apagar dados da VM. Mudanças de código por branch+PR, não diretamente na `main`; esta especificação documental foi criada diretamente na `main` por solicitação de handoff. Não criar release/tag sem autorização.

Testes mínimos: CRUD de lista própria; outro usuário não consegue descobrir/ler/editar/excluir; duplicidade membro e reenvio idempotentes; concorrência; nome vazio/limite; membro inválido/suspenso; limite 20 de guardiões; união de múltiplas listas sem duplicar; adição/remoção individual na seleção sem editar a lista; publicação grava somente IDs selecionados; edição/exclusão posteriores da lista preservam Intent publicada, aprovações e timeline; privacidade HTTP; regressão de criação, guardiões, reações, apoios, acompanhamento e Blocos 35–36. Migrações e testes PostgreSQL somente em DB descartável; backup antes de deploy se houver migration. Executar suites, lint/build, CI e relatório com SHA, PR, testes, migration, backup, deploy, saúde e pendências. Relatar separadamente laboratório, merge e produção.

## Sequência para o Codex

1. Sincronizar e diagnosticar `main` e clones sem comandos destrutivos; ler contratos vigentes e conferir eventuais mudanças desde esta especificação.
2. Auditar os componentes reais de seleção e endpoint de criação. Caso a seleção de destinatários não exista, não inventá-la.
3. Implementar a menor solução coerente, migrar e testar em PostgreSQL efêmero, garantir não regressão e privacidade.
4. Abrir PR e validar CI; seguir fluxo de integração/backup/deploy somente com autorização operacional vigente. Não forçar merge se houver impedimento.
5. Entregar relatório factual e indicar explicitamente o que foi reaproveitado, implementado e deixado para depois.
