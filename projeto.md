# INTENT OS — Documento de Produto e Engenharia

> Escrito na posição de Product Owner **e** engenheiro responsável pelo sistema. Não é um resumo do que existe (isso está em `projatual.md`) nem uma auditoria (`revisar.md`, `revisao-docs-relatorio.md`): é **como eu construiria o INTENT OS para valer**, com as decisões que sustentam a promessa do produto e as que hoje não se sustentam.
>
> **Revisão sênior incorporada.** As opiniões registradas em `visaodedoisenior.md` (Chety e Gemerson) foram lidas e integradas neste documento: a formalização do ADR-001, a correção da promessa do produto, eventos como fonte da verdade *com read model*, a fase F-1 (threat model), os invariantes numerados `INV-001..010`, a stop list e o Definition of Done do núcleo. O §19 lista o que foi aceito e o que foi ajustado.

---

## Parte I — O que eu entendi do projeto

### 1. A tese

Toda rede social existente é **síncrona no acesso**: publicar é revelar. O INTENT parte de uma inversão simples e não trivial — separar o ato de **registrar uma intenção** do ato de **revelar o conteúdo** dela, inserindo entre os dois uma **condição verificável**.

```
INTENÇÃO → CONDIÇÃO → PARTICIPAÇÃO → ACONTECIMENTO → REVELAÇÃO → ACESSO AUTORIZADO
```

Isso cria uma primitiva que a internet atual não tem de forma genérica: **compromisso público com conteúdo oculto e liberação automática governada por regra, não por vontade**.

O criador não pode antecipar a revelação. O sistema não pode revelar antes da hora. Terceiros podem provar, depois, que o conteúdo revelado é exatamente o que foi lacrado. Essa combinação — *commitment* + *tempo/quórum/meta* + *destinatário restrito* — é o produto.

**A promessa, enunciada com precisão.** É tentador dizer *"nem o criador consegue abrir antes da hora"*, mas isso é falso por construção: quem escreveu o conteúdo já o conhece. Nenhuma criptografia apaga a memória do autor. A promessa tecnicamente correta — e a que o sistema tem obrigação de cumprir — é:

> **Depois de selada a Intent, nenhuma entidade — criador, guardião, operador da plataforma — consegue, através do sistema, alterar o conteúdo, alterar a condição ou provocar a revelação antes que a condição seja satisfeita; e qualquer pessoa pode verificar depois que o revelado é exatamente o que foi selado.**

O valor não está em esconder do autor, está em **retirar do autor o controle do instante e do conteúdo da revelação**, e em tornar isso verificável. Toda vez que este documento usar a forma curta, é esta a leitura válida.

### 2. Por que isso importa (o problema real)

O que hoje é resolvido com cartório, e-mail agendado, envelope lacrado, ata de reunião ou confiança pura:

| Caso | Condição | Quem revela hoje | Problema |
| :--- | :--- | :--- | :--- |
| Resultado de edital/concurso | data + homologação | a banca | ninguém prova que não houve edição posterior |
| Testamento digital / carta póstuma | prova de óbito + guardiões | inventário | lento, caro, contestável |
| Liberação de orçamento | quórum 2 de 3 | diretoria | assinatura por e-mail, sem trava real |
| Denúncia com gatilho | "se algo me acontecer" | jornalista de confiança | ponto único de falha humano |
| Campanha coletiva | 100 apoios → revela | organizador | apoios não auditáveis, meta ajustável |
| Anúncio/lançamento | data + janela de 24h | marketing | vazamento antecipado |

Em todos os casos a pergunta é a mesma: **quem controla o instante da revelação?** Hoje: uma pessoa. No INTENT: uma regra.

### 3. O princípio que não pode ser violado

Do próprio `src/types.ts`:

> *"A plataforma não se especializa no domínio que utiliza sua infraestrutura. Nunca criar `SchoolIntent` ou `ContestIntent`. Existe apenas INTENT e seus Adaptadores Externos."*

Concordo integralmente e elevo isso a **restrição de arquitetura**: qualquer campo específico de domínio no núcleo é dívida. Domínio entra por **adaptadores** (webhooks, oráculos) e por `metadata`, nunca por novos tipos de Intent.

### 4. As 8 etapas, relidas como perguntas de engenharia

O modelo mental das 8 etapas é excelente como roteiro de produto. Como engenheiro, releio cada uma como "o que precisa ser **impossível** de burlar":

| Etapa | Pergunta de produto | Invariante de engenharia |
| :--- | :--- | :--- |
| 1. Identidade | quem é você? | identidade estável e recuperável; ações sempre atribuíveis |
| 2. Intent | o que você quer que aconteça? | intenção é imutável após ativação (só cancelável, nunca reescrita) |
| 3. Tempo | o sistema espera e revela? | nenhum ator, nem o criador, antecipa a revelação |
| 4. Pessoas | para quem / com quem? | papéis definem leitura; leitura é negada por padrão |
| 5. Aprovação | pessoas determinam? | quórum é apurado no servidor, com assinatura por aprovador |
| 6. Segurança | o segredo fica protegido? | a chave não existe no cliente antes da condição |
| 7. Participação | meta coletiva dispara? | 1 apoio = 1 identidade; contador não é editável pelo criador |
| 8. Histórico | há vida social ao redor? | opinião nunca altera condição — isolamento total |
| 9. Impacto | quem realmente moveu o quê? | reputação derivada só de fatos registrados, nunca de opinião |

### 5. O diagnóstico honesto do estado atual

O protótipo acertou o **modelo conceitual** (é a parte difícil e ela está madura) e implementou a **experiência completa** das 8 etapas. Mas ele é hoje uma **simulação fiel do produto, não o produto**, por três motivos estruturais:

1. **O cofre não protege.** `cryptoVault.ts` cifra no cliente com passphrase padrão (`DEFAULT_VAULT_KEY`). Quem lê o documento lê o segredo. A trava é de interface.
2. **A revelação é decidida pelo cliente.** `evaluateIntentConditions()` roda no navegador. Um usuário com DevTools revela quando quiser.
3. **Ninguém além do criador enxerga a Intent.** As `firestore.rules` liberam `intents/{id}` só para `creator_id == request.auth.uid`. Guardião, destinatário e apoiador não leem nada — as Etapas 4, 5, 7 e 8 funcionam de fato apenas no `localStorage`, ou seja, em um único navegador.

Nada disso invalida o trabalho: era um protótipo de produto e cumpriu o papel. Mas define exatamente onde está a fronteira entre demo e sistema, e é sobre essa fronteira que trata a Parte II.

---

## Parte II — Como eu faria

### 6. Decisão fundadora: a confiança tem que sair do cliente

Um sistema com a promessa do §1 não pode avaliar a condição nem guardar a chave onde o criador tem controle. Essa é a única decisão realmente irreversível do projeto; tudo o mais decorre dela. Registro como decisão de arquitetura, porque toda discussão futura deve ser resolvida por referência a ela:

> ### ADR-001 — The Client Is Untrusted
>
> **Contexto:** o protótipo decide no navegador a satisfação da condição, a liberação do conteúdo, a contagem de apoios e a escrita do histórico.
>
> **Decisão:** nenhuma decisão sobre satisfação de condição, liberação de conteúdo, contagem de participação, aprovação, custódia de chave ou autorização de leitura pode depender do cliente. O cliente propõe; o servidor decide e registra.
>
> **Status:** aceita, vinculante. Precede qualquer outra decisão técnica do projeto.
>
> **Consequências:** o cliente perde direito de escrita na Intent; o avaliador migra para o backend; a chave sai do navegador; as rules deixam de ser a única defesa e passam a ser a *última*.

**Divisão de responsabilidades:**

| Camada | Responsabilidade | Confiança |
| :--- | :--- | :--- |
| Cliente (React) | UX, cifragem do payload, geração do commitment | **não confiável** |
| Backend (Cloud Functions/Run) | avaliação de condições, custódia da chave, apuração de quórum, contagem de apoios | **autoritativo** |
| KMS | envelopamento da DEK | raiz de confiança |
| Firestore + Rules | persistência e leitura por papel | autoritativo para leitura |
| Cliente do destinatário | decifragem após receber a DEK | recebe a chave só depois da condição |

Regra prática que uso para revisar qualquer PR daqui pra frente: **se um `console.log` ou um `PATCH` forjado consegue mudar o resultado, o controle está no lugar errado.**

### 7. Modelo de segurança: envelope encryption com liberação condicionada

O que muda em relação ao atual: a chave que abre o conteúdo **nunca é derivável no cliente antes da revelação**.

```
[criação]
  DEK           = random(256 bits)                      // no cliente
  cipherText    = AES-256-GCM(payload, DEK, iv)         // no cliente
  content_hash  = SHA-256(payload)                      // no cliente
  commitment    = SHA-256(content_hash || salt)         // publicado imediatamente
  wrappedDEK    = KMS.encrypt(DEK)                      // no servidor; o cliente descarta a DEK

  → Firestore /intents/{id}:                  { commitment, key_status: 'SEALED' }   // metadado
  → Firestore /intents/{id}/protected/payload: { cipherText, iv, salt }              // só papel ativo lê
  → Cofre servidor (sem leitura por cliente):  { wrappedDEK }

[revelação]
  serviço avalia condição (relógio do servidor / quórum / meta)
    → grava CONDITION_SATISFIED, key_status: 'AUTHORIZED', abre reveal_window
  destinatário chama releaseKey(intentId)
    → servidor valida: papel = recipient? condição satisfeita? janela aberta?
    → devolve DEK (KMS.decrypt) e grava CONTENT_ACCESSED
  cliente decifra e confere SHA-256(plaintext) == content_hash → integrity_verified
```

Propriedades obtidas:
- **Confidencialidade real:** o servidor guarda a chave envelopada, nunca o texto claro; o Firestore guarda o texto cifrado, nunca a chave.
- **Prova pública pré-revelação:** o `commitment` é publicado na criação; qualquer um verifica depois que o conteúdo é o mesmo.
- **Janela efêmera com dente:** expirada a janela, o servidor deixa de entregar a DEK. (Honestidade necessária: quem já baixou, já tem — a janela restringe *novos* acessos, não apaga cópias. Isso precisa estar escrito na UI, não escondido.)
- **Auditoria de acesso:** cada entrega de chave é um evento com ator e timestamp.

O `commitment` deixa de ser "um detalhe da arquitetura" e sobe a requisito funcional de segurança — é ele que separa o INTENT de um post agendado:

| ID | Requisito |
| :--- | :--- |
| **RF-SEC-001** | Toda Intent com conteúdo condicionado possui um `commitment` imutável, registrado **antes** da revelação e legível por qualquer um desde a criação. |
| **RF-SEC-002** | Após a revelação, qualquer pessoa — inclusive quem não participa da Intent — consegue verificar o conteúdo contra o `commitment` publicado originalmente, com ferramenta fornecida pela própria plataforma. |

Correções imediatas em relação ao código atual: eliminar `DEFAULT_VAULT_KEY`; nunca exibir chave na UI (hoje o `JIRA.md` até pedia isso como critério de aceite); tornar `content_hash` e `commitment` obrigatórios e imutáveis após a criação.

### 8. Autorização: negar por padrão, liberar por papel

O gargalo atual (só o criador lê) se resolve com três separações, nenhuma delas opcional: **separar metadado de payload**, **materializar o papel** e **materializar o índice de listagem**.

```
/intents/{intentId}                        // SÓ metadado: título, status, progresso, commitment
/intents/{intentId}/protected/payload      // cipherText + iv  ← documento separado, leitura restrita
/intents/{intentId}/roles/{userId}         // { role, status, granted_at, revoked_at }
/intents/{intentId}/events/{eventId}       // append-only, escrita só pelo servidor
/vault/{intentId}                          // wrappedDEK, sem leitura por cliente algum
/users/{userId}/intent_refs/{intentId}     // índice de listagem: { role, status, updated_at }
```

**Por que o payload sai do documento da Intent.** Se `cipherText` mora no mesmo documento que o título, qualquer regra que libere o metadado libera o texto cifrado junto — inclusive para uma Intent pública, onde a leitura é anônima. O ciphertext sem a DEK não abre, mas entregá-lo a quem quer que passe por ali é dar tempo ilimitado de posse a um atacante que só espera um vazamento futuro de chave. Metadado é público quando o criador quer; payload nunca é.

**Por que o papel precisa de estado.** Existir um documento de papel não é o mesmo que ter direito de leitura: convite pendente e papel revogado também existem. A checagem é sobre o *estado* do papel, não sobre a sua existência.

```javascript
function role(intentId) {
  return get(/databases/$(database)/documents/intents/$(intentId)/roles/$(request.auth.uid)).data;
}
function hasActiveRole(intentId) {
  return exists(/databases/$(database)/documents/intents/$(intentId)/roles/$(request.auth.uid))
      && role(intentId).status == 'approved'
      && role(intentId).revoked_at == null;
}

match /intents/{intentId} {
  // metadado apenas; sem cipherText no documento
  allow get:       if isPublic() || (isSignedIn() && (isCreator() || hasActiveRole(intentId)));
  allow list:      if isPublic();               // feed público: só Intents com visibility == 'PUBLIC'
  allow create:    if isSignedIn() && request.resource.data.creator_id == request.auth.uid;
  allow update:    if false;   // toda mutação passa pelo backend
  allow delete:    if false;   // Intent ativa não se apaga; cancela-se
}

match /intents/{intentId}/protected/payload {
  allow read:   if isSignedIn() && hasActiveRole(intentId);   // nunca por isPublic()
  allow write:  if false;
}

match /intents/{intentId}/events/{eventId} {
  allow read:   if isSignedIn() && (isCreator() || hasActiveRole(intentId));
  allow write:  if false;      // append-only, exclusivo do servidor
}

match /vault/{intentId} { allow read, write: if false; }

// caixa de entrada do usuário: a única coleção que ele consulta para montar o painel
match /users/{userId}/intent_refs/{intentId} {
  allow read:   if request.auth.uid == userId;
  allow write:  if false;      // escrito pelo servidor junto com o papel
}
```

**Por que existe `intent_refs`.** Uma regra em `list` não filtra nada: o Firestore só autoriza a consulta se a *query* já garantir, por si, que todo resultado é permitido — e uma condição que depende de um `get()` por documento não é verificável sobre um conjunto. Ou seja, `hasActiveRole` funciona para "abrir a Intent X" e **não** funciona para "listar minhas Intents". Cada painel tem, portanto, seu caminho próprio:

| Consulta | Caminho | Regra |
| :--- | :--- | :--- |
| "minhas Intents" (qualquer papel) | query em `/users/{uid}/intent_refs` | dono do caminho |
| "abrir a Intent X" | `get` em `/intents/{X}` | papel ativo, criador ou pública |
| feed público | query em `/intents` com `where('visibility','==','PUBLIC')` | só metadado, nunca payload |

`intent_refs` é projeção, escrita pelo servidor na mesma transação que cria ou revoga o papel — e uma inconsistência entre `roles` e `intent_refs` é bug de correção, tratada pela mesma verificação periódica do §9c.

Três consequências deliberadas: **o cliente perde o direito de escrever na Intent** (some o risco de contador de apoios forjado e de histórico reescrito), **a Intent ativa deixa de ser deletável** — coerente com "intenção é compromisso" — e **revogar um papel corta o acesso imediatamente**, sem depender de apagar documentos.

### 9. Modelo de dados: o núcleo genérico

Mantenho a espinha do `types.ts` atual — ela está bem pensada — e faço três cirurgias.

**(a) Achatar a duplicação.** Hoje quase todo campo existe em dois lugares (`intent.target_supports` e `intent.conditions.target_supports`; `intent.approvers` e `intent.people.approvers`). O avaliador precisa de fallbacks encadeados, e isso é um gerador silencioso de bugs. Fonte única: `intent.conditions` e `intent.people`; o resto vira migração.

**(b) Condição como árvore, não como enum.** `HYBRID` não escala: assim que alguém pedir "(data OU quórum) E meta", o enum quebra.

```typescript
type Condition =
  | { kind: 'TIME';           operator: TimeOperator; value: string; }
  | { kind: 'APPROVAL';       mode: QuorumMode; required?: number; eligible: string[]; }
  | { kind: 'PUBLIC_SUPPORT'; target: number; }
  | { kind: 'EXTERNAL';       source_id: string; expected: unknown; }   // oráculo/webhook
  | { kind: 'INTENT';         intent_id: string; required_status: 'SATISFIED' | 'REVEALED'; }
  | { kind: 'ALL_OF';         children: Condition[]; }
  | { kind: 'ANY_OF';         children: Condition[]; };
```

Um avaliador recursivo puro — `evaluate(condition, context): { satisfied, progress, reason }` — cobre `TIME`, `APPROVAL`, `PUBLIC_SUPPORT`, `HYBRID` e, de quebra, entrega a composabilidade de Intents que o `ProximasFuncionalidades.md` já previa para a Fase 2 (com detecção de ciclo via DFS na criação do vínculo). `reason` é o que a UI exibe: *"faltam 27 apoios e 1 aprovação"*.

**(c) Eventos como fonte da verdade.** O estado da Intent passa a ser projeção do log:

```
state = fold(events, initialState)
```

`IntentEventType` já existe e é bom. O que falta é fazê-lo autoritativo: eventos gravados só pelo servidor, em subcoleção append-only, com `seq` monotônico para **ordenação**. Ganho colateral: auditoria, replay e a Etapa 9 saem de graça, porque reputação vira uma projeção diferente do mesmo log.

**Idempotência é sobre o comando, não sobre o evento.** É tentador usar `intentId + type + seq` como chave de deduplicação, mas isso não dedupica nada: uma reentrega recebe um `seq` novo e passa como se fosse fato inédito. A chave tem que ser **estável na origem** — derivada do fato que causou o evento, não da posição dele no log:

| Origem | `dedupe_key` |
| :--- | :--- |
| apoio | `SUPPORT:{intentId}:{uid}` |
| aprovação de guardião | `APPROVAL:{intentId}:{uid}` |
| disparo temporal | `TIME:{intentId}:{scheduled_for}` |
| webhook/oráculo | `EXTERNAL:{source_id}:{delivery_id}` (id da entrega, fornecido pela origem) |
| revelação | `REVEAL:{intentId}` — por definição acontece uma única vez |

A unicidade é imposta pelo banco, não pelo código: `/intents/{id}/dedupe/{dedupe_key}` é criado com `create` dentro da **mesma transação** que grava o evento, incrementa o contador e atualiza a projeção. Se a chave já existe, a transação falha e a reentrega vira no-op — o retorno para o chamador é sucesso, porque o efeito desejado já está aplicado.

```
transaction:
  create /intents/{id}/dedupe/{dedupe_key}   ← falha aqui = reentrega, aborta silenciosamente
  create /intents/{id}/events/{eventId}      ← seq = último + 1 (só ordem)
  update projeção (contador, status, key_status)
```

Isso cobre os dois casos que quebram sistemas de liberação: **reentrega** do mesmo fato pelo broker/cliente (barrada pela chave) e **concorrência real** — dois apoios distintos que cruzam a meta ao mesmo tempo, em que ambos são fatos legítimos, mas só um pode abrir a janela: a transação que perde a corrida relê a projeção e encontra a revelação já registrada sob `REVEAL:{intentId}`.

Uma ressalva de engenharia que considero importante: **isso não é "transformar o banco inteiro em Event Sourcing"**. Nenhuma tela vai reconstruir a Intent por replay a cada leitura.

```
EVENTS (append-only)  →  fonte da verdade das transições de domínio
        │ projeção (na mesma transação)
        ▼
INTENT DOC            →  read model; é o que a UI lê
```

O documento da Intent continua sendo o estado corrente materializado e barato de ler; o log é quem tem autoridade quando os dois divergem, e é a partir dele que se reconstrói, audita e faz replay. Divergência entre projeção e log é bug de gravidade máxima e deve ter uma verificação de consistência rodando periodicamente.

### 10. Como uma condição dispara sem ninguém olhando

Três caminhos, todos convergindo no mesmo avaliador:

1. **Reativo** — apoio recebido, guardião aprovou: a transação que grava o evento reavalia a condição no mesmo commit. Latência ~0.
2. **Temporal** — `TIME` não gera evento: um scheduler de 1 minuto varre `nextEvaluationAt <= now` (campo indexado, gravado na criação). Nada de varrer a coleção inteira.
3. **Externo** — webhook/oráculo assinado registra `EXTERNAL_SIGNAL_RECEIVED` e reavalia.

Idempotência e transação são obrigatórias: dois apoios simultâneos no 99º não podem abrir duas janelas de revelação.

### 11. Isolamento social (o pilar da Etapa 8)

`SocialPost` já nasce desacoplado e isso é acertado. Formalizo como invariante testável: **nenhum campo de `SocialPost` é lido por `evaluate()`**. Um teste de arquitetura deve falhar o build se o avaliador importar qualquer coisa da camada social. É a única garantia de que o debate nunca vira governança acidental.

Previsões (`PredictionDetail`) são o inverso: não afetam a Intent, mas são **resolvidas por ela**. Quando a Intent resolve, todas as previsões pendentes viram `PREDICTION_RESOLVED` com `CORRECT`/`INCORRECT`. É esse registro — e só ele — que alimenta a reputação.

### 12. Etapa 9 — impacto e reputação sem gamificação (fora do núcleo)

Antes do conteúdo desta seção, o recorte de escopo: **reputação não prova a tese e por isso não entra no núcleo.**

```
INTENT CORE                      FUTURE
├─ Intent                        └─ Impacto / Reputação
├─ Condition
├─ Participation
├─ Event
├─ Release
├─ Access
└─ Audit
```

O que prova a tese é `Intent → Condition → Event → Release automático → Access autorizado`. Enquanto essa cadeia não for à prova de ataque, reputação é distração — daí ela aparecer só em F6. O desenho abaixo fica registrado agora para que, quando chegar a hora, não se invente XP.

A orientação registrada em `revisar.md` (não implementar pontos e rankings antes de ter proveniência) está correta e mantenho. A reputação deve ser **derivada, explicável e sem números inventados**:

- **Acurácia de previsão** = acertos / resolvidas, exibida com o `n` (`"7 de 9 previsões corretas"`, nunca "870 pontos").
- **Mobilização causal** = apoios atribuídos à sua indicação via `CausalityAttribution`, com decaimento por profundidade (`referral_depth`), para que convite em cadeia não vire pirâmide.
- **Confiabilidade como guardião** = aprovações no prazo / aprovações solicitadas.

Três regras de design que me recuso a violar: reputação **por contexto**, nunca um score único; sempre **rastreável até os eventos** que a produziram; e **nunca derivada de opinião** — concordar/discordar não move reputação de ninguém, senão a Etapa 8 contamina a Etapa 9 e o isolamento cai por dentro.

### 13. Roadmap

Ordenado por risco, não por facilidade. Estimativas em sessões de trabalho minhas.

| Fase | Entrega | Por que agora | Esforço |
| :--- | :--- | :--- | :---: |
| **F-1 — Threat model** | documentar contra quem defendemos, antes de escrever cripto | cripto sem modelo de ameaça é ritual | 0,5 sessão |
| **F0 — Verdade** | Rules por papel; escrita da Intent só pelo servidor; eventos append-only | sem isso, nada acima é confiável | 1–2 sessões |
| **F1 — Cofre real** | KMS + envelope encryption; `releaseKey` no servidor; fim da chave padrão | é a promessa central do produto | 2–3 sessões |
| **F2 — Motor** | avaliador recursivo compartilhado; scheduler temporal; idempotência transacional | tira a decisão de revelar do navegador | 2 sessões |
| **F3 — Confiança** | suíte de testes (invariantes das 8 etapas), verificador público de commitment | permite mudar o núcleo sem medo | 1–2 sessões |
| **F4 — Alcance** | notificações (quórum atingido, janela abrindo/expirando), convites reais | sem notificação, o produto depende de o usuário lembrar de voltar | 1–2 sessões |
| **F5 — Composição** | Intent como guardiã de Intent (DAG + detecção de ciclo) | destrava o uso institucional | 2 sessões |
| **F6 — Etapa 9** | projeções de impacto e acurácia | só faz sentido com F0–F3 sólidos | 2 sessões |

O caminho crítico é F-1 → F0 → F1 → F2. Antes de F1 concluído, eu **não** colocaria conteúdo sensível real na plataforma, e diria isso na própria UI.

**Por que F-1 existe.** Implementar KMS sem responder "protegendo contra quem?" produz criptografia decorativa — exatamente o erro que o `DEFAULT_VAULT_KEY` é hoje. F-1 é um documento curto que responde, para cada ator, o que ele consegue tentar e o que o sistema faz a respeito:

| Ator | O que ele tenta | O que precisa ser verdade |
| :--- | :--- | :--- |
| Criador | antecipar revelação, trocar o conteúdo selado, baixar a meta | `releaseKey` nega por papel/condição; `commitment` imútavel; condição congelada na ativação |
| Participante/apoiador | inflar contador, apoiar várias vezes, forjar referência | 1 apoio por identidade; contagem só no servidor; rate limit |
| Guardião/aprovador | aprovar por outro, aprovar depois de revogado | aprovação vinculada ao `uid`, checada contra `eligible_approvers` no instante |
| Destinatário | reusar a chave depois da janela, repassar conteúdo | entrega de DEK expira; marca d'água; cópia repassada é risco aceito e declarado |
| Conta comprometida | agir como o dono | reautenticação em operações críticas; todo acesso à chave vira evento |
| Operador da infra | ler o cofre | KMS com IAM separado e log de acesso; caminho para *split-key* entre guardiões |
| Vazamento de ciphertext | decifrar offline | AES-256-GCM com DEK aleatória; ciphertext sozinho não serve de nada |

A saída de F-1 é a lista do que **aceitamos** não defender (cópia pós-revelação, memória do autor) escrita de forma explícita — no documento e na UI.

### 14. Os invariantes: a especificação executável do produto

Esta é a seção mais importante do documento. Não é uma lista de testes desejados: é **a definição formal do que o INTENT é**. Cada item é uma afirmação que o produto faz ao usuário; se não houver um teste automatizado que a prove, a afirmação é marketing.

Por isso ganham identificador próprio e viram a espinha da rastreabilidade (§18):

| ID | Invariante | Etapa | Teste |
| :--- | :--- | :---: | :--- |
| **INV-001** | O criador não obtém a DEK antes da condição satisfeita | 6 | `releaseKey` chamado pelo criador com Intent selada retorna 403 |
| **INV-002** | Condição de Intent ativa não pode ser reescrita | 2 | alterar `target_supports`/prazo após ativação é rejeitado no servidor |
| **INV-003** | Quórum não libera antes do limiar | 5 | 2 de 3: não libera com 1; libera com 2; a 3ª não gera segunda liberação |
| **INV-004** | Uma identidade apoia uma única vez | 7 | duplo apoio do mesmo `uid` incrementa o contador em 1 |
| **INV-005** | Janela expirada impede nova entrega de chave | 3 | destinatário que não acessou dentro da janela recebe negação |
| **INV-006** | Conteúdo revelado corresponde ao commitment original | 6 | `SHA-256(plaintext)` == `content_hash` e `SHA-256(content_hash \|\| salt)` == `commitment` |
| **INV-007** | Atividade social não altera condição | 8 | 500 debates/votações não mudam um campo de `conditions`; teste de arquitetura barra o import |
| **INV-008** | Evento duplicado não causa segunda revelação | 7 | reentrega do mesmo evento é idempotente |
| **INV-009** | O grafo de Intents não contém ciclos | — | vínculo A→B→A recusado na criação |
| **INV-010** | Não-participante não lê dado protegido | 4 | negação de leitura verificada contra o emulador das rules |

Se os dez passam, o produto faz o que promete. Nenhuma fase de F0 a F3 é dada como concluída sem os invariantes correspondentes verdes.

### 15. Riscos que assumo explicitamente

| Risco | Consequência | Mitigação |
| :--- | :--- | :--- |
| Custódia central da chave | o operador tecnicamente poderia abrir | KMS com log de acesso; roadmap para *split-key*/threshold entre guardiões |
| Janela expirada não apaga cópias | falsa sensação de efemeridade | dizer isso na UI; marca d'água por destinatário |
| Conteúdo ilegal lacrado | responsabilidade legal sobre o que não se pode ver | denúncia sobre o *commitment*, política de retenção, resposta a ordem judicial |
| Meta de apoios inflada | mina a Etapa 7 | 1 apoio por identidade verificada; rate limit; auditoria da lista |
| Complexidade do avaliador | bugs que revelam cedo ou nunca | avaliador puro, 100% coberto por testes, compartilhado cliente/servidor |
| Custo de scheduler por minuto | conta do Firebase | só varre `nextEvaluationAt` indexado |

### 16. O que eu deliberadamente não farei agora

Uma stop list vale tanto quanto um roadmap, porque o risco real deste projeto não é falta de ideia — é diluir esforço antes de a tese ser verdadeira. Até F3 concluir, estão **congelados**:

ranking e pontuação · gamificação · algoritmo sofisticado de feed · marketplace · novos tipos de condição além dos cinco do §9b · novos tipos de conteúdo · blockchain (o `commitment` não pede uma) · microserviços · IA · automações genéricas.

O critério para descongelar é uma sequência de seis perguntas respondidas com sim e com teste:

```
Can we seal?      → conteúdo selado sem chave no cliente          (INV-001)
Can we wait?      → ninguém antecipa a revelação                  (INV-002, INV-005)
Can we verify?    → commitment conferível por terceiros           (INV-006)
Can we release?   → liberação automática, uma única vez           (INV-003, INV-008)
Can we authorize? → só quem tem papel lê                          (INV-010)
Can we prove?     → histórico autoritativo e reconstruível         (INV-004, INV-007)
```

### 17. Como eu sei que deu certo

Métricas que interessam (nenhuma delas é vaidade):
- **Taxa de revelação automática** — % de Intents reveladas por regra, sem intervenção manual. Se for baixa, o produto está sendo usado como agenda, não como cofre.
- **Diversidade de domínios** — quantos casos de uso distintos convivem sem código específico. Mede se o princípio de independência de domínio sobreviveu.
- **Verificações de commitment** — quantas pessoas de fato conferem a prova. Mede se a auditabilidade é usada ou é enfeite.
- **Participação por indicação** — profundidade média da cadeia causal. Mede se a rede cresce por mobilização real.

---

### 18. Como esse trabalho vira execução

O `JIRA.md` hoje usa `Epic → Story`. Para este próximo ciclo isso é insuficiente, porque boa parte de F-1 a F2 não é implementação — é **descoberta**. Adotaria `EPIC · FEATURE · STORY · SPIKE · BUG · TASK`, com destaque para o SPIKE (caixa de tempo, entrega um documento de decisão, não código):

| SPIKE | Pergunta a responder | Fase |
| :--- | :--- | :---: |
| SPIKE-001 | Threat model do release engine | F-1 |
| SPIKE-002 | Modelo de envelope encryption e custódia (KMS, rotação, split-key) | F1 |
| SPIKE-003 | Modelo de condições compostas e migração do `HYBRID` | F2 |
| SPIKE-004 | Estratégia de scheduler temporal (precisão × custo) | F2 |
| SPIKE-005 | Verificador público de commitment | F3 |

E a rastreabilidade passa a fechar o ciclo inteiro, de forma que nenhum item exista sem prova:

```
Invariante (INV-00x)  →  Epic  →  Story  →  Critério de aceite  →  Teste automatizado
```

Na prática: **critério de aceite que não vira teste não é critério de aceite**, e story que não rastreia até um invariante ou até um problema de usuário real é candidata a não ser feita.

### 19. Registro da revisão sênior (`visaodedoisenior.md`)

O que veio da revisão e onde foi parar:

| Ponto | Origem | Decisão |
| :--- | :--- | :--- |
| "O cliente não pode ser a autoridade" vira ADR | Chety | **Aceito** — ADR-001 no §6 |
| Corrigir a promessa: o autor conhece o próprio conteúdo | Chety | **Aceito** — promessa reescrita no §1 |
| Commitment como requisito, não como detalhe | Chety | **Aceito** — RF-SEC-001/002 no §7 |
| Eventos autoritativos, mas com read model | Chety | **Aceito com ajuste** — §9c: log é autoridade, doc da Intent é projeção; sem replay por leitura |
| Isolamento social como invariante de arquitetura | Chety / Gemerson | **Já previsto**, reforçado como INV-007 com teste de arquitetura |
| Etapa 9 fora do núcleo | Chety | **Aceito** — §12 abre com o recorte CORE/FUTURE |
| Fase F-1 de threat model antes da F0 | Chety | **Aceito** — §13, com a matriz de atores |
| Os 10 testes são invariantes de produto | Chety | **Aceito** — §14 renumerado como INV-001..010 e ligado a etapas |
| Tipos de item no Jira, com SPIKE | Chety | **Aceito** — §18 |
| Stop list | Chety | **Aceito** — §16 |
| DoD do núcleo: usuário malicioso não viola invariante | Chety | **Aceito** — §20 |
| Tese causal, independência de domínio, condição recursiva, envelope encryption, reputação rastreável | Gemerson | **Confirmados** — mantidos sem alteração |
| Janela efêmera restringe entrega, não apaga cópias | Gemerson | **Confirmado** — já declarado no §7 e no §15; deve estar também na UI |
| Ordem F0→F1→F2→F3 antes de social/reputação | ambos | **Confirmada** — §13 |

Divergência registrada: nenhuma de fundo. As duas revisões empurram na mesma direção — **não redesenhar o INTENT, e sim torná-lo verdadeiro**. É também a minha leitura, e por isso este documento não propõe nenhuma funcionalidade nova antes de F3.

### 20. Definition of Done do núcleo

> **O INTENT não está pronto quando a interface aparentar bloquear o conteúdo. Ele estará pronto quando um usuário malicioso — usando o cliente, as APIs e as permissões que ele legitimamente possui — não conseguir violar nenhum dos dez invariantes.**

Esse é o critério de aceite do núcleo inteiro, acima de qualquer story. Enquanto ele não for atingido, o produto se descreve na UI como demonstração, não como cofre.

---

## 21. Fechamento

O que o INTENT tem de mais valioso não é a interface, nem o esquema de dados: é a **clareza da tese** — a revelação governada por regra em vez de por vontade — sustentada por um modelo de dados que já é genérico o bastante para não trair essa tese.

O que falta é fazer o sistema *merecer* a confiança que a interface já aparenta ter. Isso é um trabalho concentrado, não infinito: tirar a decisão e a chave do navegador, tornar o log autoritativo e provar tudo com os dez invariantes. **Não é um redesenho do INTENT — é torná-lo verdadeiro.** Feito isso, o INTENT deixa de ser uma boa demonstração de uma ideia forte e passa a ser infraestrutura em que faz sentido depositar um segredo — que é, no fim, a única métrica que importa.
