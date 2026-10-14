# Intent — contrato de comportamento

Base inspecionada: código de produto em [Status](04_STATUS.md). Estas regras consolidam o que está implementado e os invariantes aprovados; propostas adicionais estão em [Novas funcionalidades](8_Novas_funcionalidades.md). Em divergência, registrar lacuna com evidência e decisão antes de mudar o comportamento.

## 1. Identidade, autorização e projeções

Firebase Authentication fornece o token Bearer; o backend verifica Firebase Admin, carrega/sincroniza a conta PostgreSQL e usa `request.appUser.id`. Não aceitar creatorId/actorId/ownerId arbitrários no comando protegido. Um userId alvo de seleção de pessoa não substitui a autoria autenticada. Conta deve estar ativa conforme middleware e transações.

Usar seleção explícita e DTO público. Não retornar usuário/modelo bruto, email, firebaseUid, credenciais, auditoria, ciphertext/IV/tag nem conteúdo protegido em feed, busca, comentários, métricas ou história. O endpoint do próprio perfil possui contrato próprio e não autoriza exposição em perfis públicos.

| Estado/visibilidade | Regra de leitura da Intent |
|---|---|
| DRAFT | Só criador; terceiros recebem404, antes de qualquer exceção de guardião |
| PUBLIC publicada/realizada | Pode haver leitura anônima nas rotas com autenticação opcional; não presumir escrita anônima |
| FOLLOWERS | Criador ou seguidor atual, segundo regra do backend |
| PRIVATE | Criador ou guardião listado, conforme autorização existente; não reduzir para somente criador |
| CANCELLED | Metadados conforme autorização; não decifrar conteúdo |
| Estado/visibilidade desconhecidos | Negar acesso |

Criador inativo normalmente não é apresentado a terceiros; o detalhe contém tratamento próprio para o criador, que não deve ser generalizado a feeds. Qualquer ação ligada à Intent deve respeitar o acesso exigido por seu serviço. Desacompanhar remove o vínculo pessoal idempotentemente mesmo se a Intent deixou de ser acessível, sem revelar sua existência.

## 2. Criação, publicação e condição

Fonte: [schema de entrada](../backend/src/domain/intent-schemas.ts) e [serviço de Intent](../backend/src/services/intent-service.ts).

| Campo | Contrato de criação |
|---|---|
| title/story | Trim;3–160 /3–5000 caracteres |
| category | SPORTS, ENTERTAINMENT, TECHNOLOGY, EDUCATION, HEALTH_WELLNESS, CAREER_BUSINESS, COMMUNITY_CAUSES, PERSONAL_LIFE ou OTHER padrão |
| conditionType | SUPPORT padrão, DATE ou GUARDIANS |
| supportGoal | Inteiro1–1.000.000; obrigatório para SUPPORT |
| revealAt | Data futura obrigatória para DATE |
| guardianIds | UUIDs únicos,1–20 para GUARDIANS, pessoas ativas |
| guardianApprovalGoal | Inteiro1–20 e não superior ao conjunto selecionado |
| revealContent | Texto1–10.000 caracteres; a implementação atual ainda exige conteúdo, apesar da visão admitir Intents sem conteúdo |
| visibility | PUBLIC padrão, FOLLOWERS ou PRIVATE; PRIVATE+SUPPORT rejeitado |
| status | DRAFT ou PUBLISHED padrão; demais campos de autoridade não são aceitos |

O comando é strict. SUPPORT realiza ao atingir meta; DATE é avaliada no detalhe, sem garantia de job exato no horário; GUARDIANS realiza por quórum. Não existe composição geral AND/OR, política futsal/salão ou destinatário independente só porque aparece em propostas.

DRAFT grava `publishedAt=null` e `INTENT_CREATED` com seu estado. Publicação posterior só pelo criador ativo transiciona DRAFT→PUBLISHED e registra `INTENT_PUBLISHED` uma vez. Na implementação auditada, publicar uma Intent já PUBLISHED **ou REALIZED** retorna projeção atual sem novo evento; CANCELLED retorna409 `CANNOT_PUBLISH_CANCELLED`, demais estados incompatíveis409 `INVALID_INTENT_STATUS`. O handoff antigo que dizia409 para REALIZED foi corrigido pela leitura do código.

Criação direta PUBLISHED registra criação, não inventa uma transição anterior de rascunho. Migration DRAFT remove NOT NULL/default de published_at existente; não cria coluna nem backfill narrativo. Rascunhos ficam fora de feeds/busca/atividade/métricas públicas e bloqueiam apoio, aprovação, comentário, reação e acompanhar conforme status/acesso dos serviços. Guardião de rascunho não tem acesso antes da publicação.

## 3. Apoio, aprovação e realização

Criador não apoia a própria Intent. Apoio é único por usuário/Intent, exige SUPPORT aberta e autorização; remoção não pode alterar apoio após realização. Contador deriva das operações transacionais; não aceitar contador do cliente. Reação, comentário, seguir e acompanhar não realizam Intent.

Criador pode se incluir **explicitamente** como guardião, inclusive único, contando no limite20. Criar não aprova; aprovação exige ação autenticada e presença na lista. Reenvio não duplica aprovação/evento/notificação. Guardião é voluntário. Não criar notificação ao próprio ator. `guardianApprovalCount` fornece contagem sem expor identidade dos aprovadores a quem não a pode receber. Manter separado o veto de o dono ser membro da própria lista pessoal: não é veto ao dono ser guardião da Intent.

Realização, contador e eventos pertinentes são transacionais. Conteúdo só é decifrado no backend após estado/condição e autorização. Não fabricar conteúdo otimista no frontend. Datas são persistidas com TIMESTAMPTZ; tratar fuso de apresentação explicitamente. A regra vigente realiza por meta/quórum imediato, distinta das políticas futuras de prazo.

## 4. Idempotência e criptografia

Mecanismo: [mutação e idempotência](../backend/src/services/intent-mutation.ts). `Idempotency-Key` opcional tem1–128 caracteres ASCII de letras/números/ponto/underscore/dois-pontos/hífen. Escopo por ator+operação+chave, incluindo alvo normalizado quando aplicável. Criar sem chave pode criar outra Intent no reenvio. Chave de criação reutilizada com comando diferente gera409. Replay retorna resposta histórica e não consulta estado novo; usar chave nova para nova intenção. Falhas de validação/autorização/transação não equivalem a comando concluído.

Reserva, mutação, evento e resposta pertencem à transação serializável; concorrência usa unicidade e tentativas limitadas, com409 de conflito quando esgotadas. HMAC-SHA256 do comando usa separação de domínio e chave configurada; preservar registros para manter garantia. Inspecionar serviço antes de alterar escopo/operações.

[Criptografia](../backend/src/domain/reveal-crypto.ts): AES-256-GCM no servidor, chave32 bytes Base64, IV aleatório12 bytes e associated data `intent:<id>:reveal:v<versão>`. Não prometer que operador com chave/servidor não possa decifrar. Não existe prova de commitment público/KMS só por haver AES-GCM. Dump sem chave não restaura conteúdo; chave sem dump não restaura dados.

## 5. Interações, listas e notificações

- Reação: LIKE/LOVE/CELEBRATE, uma por usuário/Intent; upsert para trocar e remoção idempotente. Não escreve apoio ou evento de realização. Comentário é texto trim1–500, projeção pública e até50 por listagem atual, sem promessa de edição/árvore/paginação que não existe.
- Follow: relação única, sem auto-follow; listas paginadas com usuários ativos. Feed following limita-se a PUBLIC de autores seguidos, não altera a autorização individual de FOLLOWERS no detalhe.
- Watch: relação única e idempotente independente de apoio/reação/follow; detalhe retorna viewerWatching nos ramos publicado e realizado. Não inferir vínculo por modal de notificações.
- Listas pessoais: privadas, titularidade pela sessão; nome normalizado1–80 com unicidade por dono sem diferença de caixa; membro ativo único e diferente do proprietário da lista; remoção idempotente. Expansão de listas gera UUIDs individuais deduplicados, revisados e limitados pelo destino. Alterar/excluir lista não reescreve Intent, aprovações ou história anteriores. Não criar feed/grupo social ou novas permissões pela lista.
- Notificação: criada junto ao efeito de origem quando aplicável; chave única e sem autoenvio. Realização notifica watchers elegíveis ativos, exclui ator/criador e revalida audiência FOLLOWERS/PRIVATE. Tipos e compatibilidade estão no enum Prisma; não inferir emissão de todo tipo só por existir enum.
- Lista de notificações revalida acesso para o resumo da Intent, que pode ser nulo. Contador é do destinatário; leitura individual alheia/inexistente404; leitura em massa somente própria. UI só decrementa por sucesso; filtros são locais aos itens carregados, não filtros globais do banco.

## 6. Busca, perfil, histórico e consistência

Busca autenticada: q2–80, limit1–20/default10; kind=all/intents/users, status=PUBLISHED/REALIZED e period=all/week/month. Cursor opaco só na aba específica; fronteiras por criação+id de Intent e nome+id de usuário. Nunca pesquisar conteúdo criptografado. Seleção segue autorização e estado ativo.

Perfil público: só atividade em PUBLIC PUBLISHED/REALIZED de criador ativo, inclusive ao consultar o próprio perfil público. Apoios/reação/comentário continuam métricas distintas. Participações realizadas contam Intents distintas com apoio, reação ou comentário atual, não somatório de interações. Não afirmar que vínculo atual prova participação antes da realização.

37A acrescenta realizationEligibleCount/realizationRate e conquistas derivadas: primeira criação, primeira realização,5/10 realizações e primeira participação realizada. Taxa é realizadas/elegíveis públicas, null sem amostra; não criar score, ranking ou nota de confiabilidade. Conquistas não possuem achievedAt porque contador presente não comprova horário do marco.

Atividade pública de perfil projeta vínculos atuais: criação por createdAt, apoio por createdAt, reação por updatedAt, comentário por createdAt e participação em realizada por realizedAt. Remoção/alteração de vínculo pode mudar a projeção; não é log imutável nem snapshot entre páginas. Cursor desempata horário+evento antes do limite; preservar cancelamento/isolamento ao trocar filtro ou perfil.

História **da Intent** é diferente: projeta `domain_events` reais de INTENT_CREATED, INTENT_PUBLISHED, SUPPORT_RECEIVED, SUPPORT_REMOVED, GUARDIAN_APPROVED e INTENT_REALIZED. Retorna somente id/type/occurredAt, ordenação desc e paginação; não retorna payload/ator nem reconstrói marcos retroativos.

Frontend deve ignorar respostas antigas após troca de Intent/perfil/filtro/desmontagem. Se mutação confirmou mas GET falhou, informar falha de atualização e permitir reconsulta dirigida; não afirmar que a mutação falhou, nem liberar conteúdo por suposição.

Links compartilháveis usam `/?user=<uuid>` ou `/?intent=<uuid>`; identificador não concede acesso. Navegação interna diferencia views e preserva destino através do login/popstate. Não prometer rotas /user/:id e /intent/:id descartadas. Clipboard nativo/fallback exige feedback real de sucesso ou falha.
