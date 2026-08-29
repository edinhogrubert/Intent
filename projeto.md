# INTENT OS — Documento de Produto e Engenharia

> Escrito na posição de Product Owner **e** engenheiro responsável pelo sistema. Não é um resumo do que existe (isso está em `projatual.md`) nem uma auditoria (`revisar.md`, `revisao-docs-relatorio.md`): é **como eu construiria o INTENT OS para valer**, com as decisões que sustentam a promessa do produto e as que hoje não se sustentam.

---

## Parte I — O que eu entendi do projeto

### 1. A tese

Toda rede social existente é **síncrona no acesso**: publicar é revelar. O INTENT parte de uma inversão simples e não trivial — separar o ato de **registrar uma intenção** do ato de **revelar o conteúdo** dela, inserindo entre os dois uma **condição verificável**.

```
INTENÇÃO → CONDIÇÃO → PARTICIPAÇÃO → ACONTECIMENTO → REVELAÇÃO → ACESSO AUTORIZADO
```

Isso cria uma primitiva que a internet atual não tem de forma genérica: **compromisso público com conteúdo oculto e liberação automática governada por regra, não por vontade**.

O criador não pode antecipar a revelação. O sistema não pode revelar antes da hora. Terceiros podem provar, depois, que o conteúdo revelado é exatamente o que foi lacrado. Essa combinação — *commitment* + *tempo/quórum/meta* + *destinatário restrito* — é o produto.

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

Um sistema cuja proposta é *"nem o criador consegue abrir antes da hora"* não pode avaliar a condição nem guardar a chave onde o criador tem controle. Essa é a única decisão realmente irreversível do projeto; tudo o mais decorre dela.

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

  → Firestore: { cipherText, iv, salt, commitment, key_status: 'SEALED' }
  → Cofre servidor (coleção sem leitura pública): { wrappedDEK }

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

Correções imediatas em relação ao código atual: eliminar `DEFAULT_VAULT_KEY`; nunca exibir chave na UI (hoje o `JIRA.md` até pedia isso como critério de aceite); tornar `content_hash` e `commitment` obrigatórios e imutáveis após a criação.

### 8. Autorização: negar por padrão, liberar por papel

O gargalo atual (só o criador lê) se resolve materializando os papéis em um índice consultável pelas rules, sem exigir leitura do documento inteiro:

```
/intents/{intentId}                    // metadados + cipherText, sem chave
/intents/{intentId}/roles/{userId}     // { role, status, added_at }  ← materialização do papel
/intents/{intentId}/events/{eventId}   // append-only, escrita só pelo servidor
/vault/{intentId}                      // wrappedDEK, sem leitura por cliente algum
```

```javascript
function hasRole(intentId) {
  return exists(/databases/$(database)/documents/intents/$(intentId)/roles/$(request.auth.uid));
}

match /intents/{intentId} {
  allow get, list: if isSignedIn() && (isCreator() || hasRole(intentId) || isPublic());
  allow create:    if isSignedIn() && request.resource.data.creator_id == request.auth.uid;
  allow update:    if false;   // toda mutação passa pelo backend
  allow delete:    if false;   // Intent ativa não se apaga; cancela-se
}

match /intents/{intentId}/events/{eventId} {
  allow read:   if hasRole(intentId) || isCreator();
  allow write:  if false;      // append-only, exclusivo do servidor
}

match /vault/{intentId} { allow read, write: if false; }
```

Duas consequências deliberadas: **o cliente perde o direito de escrever na Intent** (some o risco de contador de apoios forjado e de histórico reescrito) e **a Intent ativa deixa de ser deletável**, o que é coerente com "intenção é compromisso".

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

`IntentEventType` já existe e é bom. O que falta é fazê-lo autoritativo: eventos gravados só pelo servidor, em subcoleção append-only, com `seq` monotônico e chave de idempotência (`intentId + type + seq`) — isso resolve a US-07.2 de verdade, não por checagem de estado no cliente. Ganho colateral: auditoria, replay e a Etapa 9 saem de graça, porque reputação vira uma projeção diferente do mesmo log.

### 10. Como uma condição dispara sem ninguém olhando

Três caminhos, todos convergindo no mesmo avaliador:

1. **Reativo** — apoio recebido, guardião aprovou: a transação que grava o evento reavalia a condição no mesmo commit. Latência ~0.
2. **Temporal** — `TIME` não gera evento: um scheduler de 1 minuto varre `nextEvaluationAt <= now` (campo indexado, gravado na criação). Nada de varrer a coleção inteira.
3. **Externo** — webhook/oráculo assinado registra `EXTERNAL_SIGNAL_RECEIVED` e reavalia.

Idempotência e transação são obrigatórias: dois apoios simultâneos no 99º não podem abrir duas janelas de revelação.

### 11. Isolamento social (o pilar da Etapa 8)

`SocialPost` já nasce desacoplado e isso é acertado. Formalizo como invariante testável: **nenhum campo de `SocialPost` é lido por `evaluate()`**. Um teste de arquitetura deve falhar o build se o avaliador importar qualquer coisa da camada social. É a única garantia de que o debate nunca vira governança acidental.

Previsões (`PredictionDetail`) são o inverso: não afetam a Intent, mas são **resolvidas por ela**. Quando a Intent resolve, todas as previsões pendentes viram `PREDICTION_RESOLVED` com `CORRECT`/`INCORRECT`. É esse registro — e só ele — que alimenta a reputação.

### 12. Etapa 9 — impacto e reputação sem gamificação

A orientação registrada em `revisar.md` (não implementar pontos e rankings antes de ter proveniência) está correta e mantenho. A reputação deve ser **derivada, explicável e sem números inventados**:

- **Acurácia de previsão** = acertos / resolvidas, exibida com o `n` (`"7 de 9 previsões corretas"`, nunca "870 pontos").
- **Mobilização causal** = apoios atribuídos à sua indicação via `CausalityAttribution`, com decaimento por profundidade (`referral_depth`), para que convite em cadeia não vire pirâmide.
- **Confiabilidade como guardião** = aprovações no prazo / aprovações solicitadas.

Três regras de design que me recuso a violar: reputação **por contexto**, nunca um score único; sempre **rastreável até os eventos** que a produziram; e **nunca derivada de opinião** — concordar/discordar não move reputação de ninguém, senão a Etapa 8 contamina a Etapa 9 e o isolamento cai por dentro.

### 13. Roadmap

Ordenado por risco, não por facilidade. Estimativas em sessões de trabalho minhas.

| Fase | Entrega | Por que agora | Esforço |
| :--- | :--- | :--- | :---: |
| **F0 — Verdade** | Rules por papel; escrita da Intent só pelo servidor; eventos append-only | sem isso, nada acima é confiável | 1–2 sessões |
| **F1 — Cofre real** | KMS + envelope encryption; `releaseKey` no servidor; fim da chave padrão | é a promessa central do produto | 2–3 sessões |
| **F2 — Motor** | avaliador recursivo compartilhado; scheduler temporal; idempotência transacional | tira a decisão de revelar do navegador | 2 sessões |
| **F3 — Confiança** | suíte de testes (invariantes das 8 etapas), verificador público de commitment | permite mudar o núcleo sem medo | 1–2 sessões |
| **F4 — Alcance** | notificações (quórum atingido, janela abrindo/expirando), convites reais | sem notificação, o produto depende de o usuário lembrar de voltar | 1–2 sessões |
| **F5 — Composição** | Intent como guardiã de Intent (DAG + detecção de ciclo) | destrava o uso institucional | 2 sessões |
| **F6 — Etapa 9** | projeções de impacto e acurácia | só faz sentido com F0–F3 sólidos | 2 sessões |

O caminho crítico é F0 → F1 → F2. Antes de F1 concluído, eu **não** colocaria conteúdo sensível real na plataforma, e diria isso na própria UI.

### 14. Testes: os invariantes que definem o produto

Sem suíte automatizada hoje. A primeira suíte não deve testar componentes — deve testar as afirmações que o produto faz:

1. Criador **não** obtém a DEK antes da condição (chamada a `releaseKey` retorna 403).
2. Alterar `target_supports` depois de ativa é rejeitado.
3. Quórum de 2 de 3 não libera com 1 aprovação; libera com 2; a 3ª não gera segunda liberação.
4. O mesmo usuário apoiando duas vezes incrementa o contador uma vez.
5. Janela expirada não entrega chave a quem ainda não acessou.
6. `SHA-256(plaintext revelado)` bate com `content_hash`, e `SHA-256(content_hash || salt)` bate com o `commitment` publicado na criação.
7. 500 debates na camada social não alteram um único campo de `conditions`.
8. Evento duplicado não produz segunda revelação.
9. Vínculo A→B→A entre Intents é recusado na criação.
10. Não-participante recebe negação de leitura (teste contra o emulador das rules).

Cada um mapeia direto para uma das etapas. Se os dez passam, o produto faz o que promete; se algum falha, a promessa é marketing.

### 15. Riscos que assumo explicitamente

| Risco | Consequência | Mitigação |
| :--- | :--- | :--- |
| Custódia central da chave | o operador tecnicamente poderia abrir | KMS com log de acesso; roadmap para *split-key*/threshold entre guardiões |
| Janela expirada não apaga cópias | falsa sensação de efemeridade | dizer isso na UI; marca d'água por destinatário |
| Conteúdo ilegal lacrado | responsabilidade legal sobre o que não se pode ver | denúncia sobre o *commitment*, política de retenção, resposta a ordem judicial |
| Meta de apoios inflada | mina a Etapa 7 | 1 apoio por identidade verificada; rate limit; auditoria da lista |
| Complexidade do avaliador | bugs que revelam cedo ou nunca | avaliador puro, 100% coberto por testes, compartilhado cliente/servidor |
| Custo de scheduler por minuto | conta do Firebase | só varre `nextEvaluationAt` indexado |

### 16. Como eu sei que deu certo

Métricas que interessam (nenhuma delas é vaidade):
- **Taxa de revelação automática** — % de Intents reveladas por regra, sem intervenção manual. Se for baixa, o produto está sendo usado como agenda, não como cofre.
- **Diversidade de domínios** — quantos casos de uso distintos convivem sem código específico. Mede se o princípio de independência de domínio sobreviveu.
- **Verificações de commitment** — quantas pessoas de fato conferem a prova. Mede se a auditabilidade é usada ou é enfeite.
- **Participação por indicação** — profundidade média da cadeia causal. Mede se a rede cresce por mobilização real.

---

## 17. Fechamento

O que o INTENT tem de mais valioso não é a interface, nem o esquema de dados: é a **clareza da tese** — a revelação governada por regra em vez de por vontade — sustentada por um modelo de dados que já é genérico o bastante para não trair essa tese.

O que falta é fazer o sistema *merecer* a confiança que a interface já aparenta ter. Isso é um trabalho concentrado, não infinito: tirar a decisão e a chave do navegador, tornar o log autoritativo e provar tudo com dez testes. Feito isso, o INTENT deixa de ser uma boa demonstração de uma ideia forte e passa a ser infraestrutura em que faz sentido depositar um segredo — que é, no fim, a única métrica que importa.
