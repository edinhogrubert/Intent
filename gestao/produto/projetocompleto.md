# INTENT — ESPECIFICAÇÃO CANÔNICA DO PRODUTO E BLUEPRINT EXECUTÁVEL DO MVP

> **Arquivo canônico:** `projetocompleto.md`  
> **Versão:** 3.0.0  
> **Status:** Aprovado para planejamento e geração assistida de código  
> **Produto:** Intent — Rede Social de Acontecimentos  
> **Pergunta central:** **O que você quer fazer acontecer?**  
> **Propósito deste documento:** permitir que uma equipe ou uma IA de geração de código compreenda, implemente, teste e implante o MVP do Intent sem reduzir o produto a um cofre, aplicativo de metas, enquete ou rede social genérica.

---

## 0. DIRETIVAS PARA QUEM VAI GERAR O CÓDIGO

Este documento é a fonte de verdade do produto. Antes de implementar:

1. Leia o documento inteiro.
2. Não invente funcionalidades fora do escopo do MVP.
3. Não transforme o Intent em gerenciador de tarefas, hábitos, crowdfunding, cofre digital ou clone de outra rede social.
4. Preserve a universalidade do domínio: existe apenas `Intent`; integrações e setores externos adaptam seus eventos ao contrato do Intent.
5. Mantenha regras críticas, autorização, contadores, reputação e revelação no backend.
6. Nunca confie em contadores, papéis, status ou permissões enviados pelo frontend.
7. Use linguagem humana na interface e termos técnicos apenas no código e na documentação.
8. Implemente primeiro uma fatia vertical funcional: autenticação → feed → criação por apoios → participação → condição alcançada → revelação → reputação.
9. Escreva testes para regras de domínio antes de expandir a interface.
10. Não implemente microserviços, Kubernetes, blockchain, chamadas de áudio/vídeo, API pública ou webhooks no primeiro MVP.

Quando houver divergência entre o código antigo e este documento, este documento prevalece. O código atual é prova de conceito e fonte de componentes reaproveitáveis, não a arquitetura final.

---

## 1. RESUMO DO PRODUTO

### 1.1 Definição

O **Intent** é uma rede social de expectativas e acontecimentos condicionados. Pessoas publicam algo que desejam fazer acontecer, definem uma condição verificável e convidam outras pessoas a acompanhar, conversar, apoiar, participar ou aprovar. Quando a condição é satisfeita, o sistema registra a realização e, quando aplicável, revela o conteúdo preparado anteriormente.

### 1.2 Posicionamento

> **O Intent não será somente uma rede onde acontecimentos são criados. Será também uma rede onde as pessoas constroem reputação pública pela capacidade de criar, participar, mobilizar e realizar acontecimentos.**

### 1.3 Pergunta central da marca

> **O que você quer fazer acontecer?**

Essa pergunta não é um campo técnico. É o ponto de entrada emocional e funcional do produto.

### 1.4 Promessa curta

> Prepare agora. Mobilize pessoas. Faça acontecer.

### 1.5 Ciclo principal

```text
Criar → Participar → Mobilizar → Realizar → Ser reconhecido → Criar novamente
```

### 1.6 Diferencial

Em outras redes, o elemento central costuma ser uma publicação, foto ou vídeo. No Intent, o elemento central é a **expectativa verificável de algo acontecer**.

- A história pública gera interesse.
- A condição explica o que falta.
- As pessoas participam e conversam.
- O conteúdo preparado cria expectativa.
- A realização produz um acontecimento social.
- O histórico e a reputação demonstram o comportamento do criador.

---

## 2. PRINCÍPIOS DE PRODUTO

### 2.1 Universalidade

O sistema não cria tipos de domínio como `SchoolIntent`, `FootballIntent` ou `CompanyIntent`. Existe apenas `Intent`, configurada por conteúdo, condição, audiência e participantes.

Setores externos devem adaptar seus fatos ao contrato universal.

### 2.2 Simplicidade progressiva

O usuário iniciante não precisa entender:

- Rule Engine;
- payload;
- commitment;
- webhook;
- quórum;
- operador lógico;
- idempotência;
- máquina de estados.

Ele deve conseguir criar sua primeira Intent respondendo perguntas simples. Recursos avançados permanecem escondidos até serem necessários.

### 2.3 Social antes de administrativo

A tela inicial é um feed de pessoas e acontecimentos, não um dashboard pessoal. O usuário deve perceber imediatamente:

- quem está fazendo algo;
- o que está quase acontecendo;
- como pode participar;
- o que seus amigos acompanham;
- quem está em destaque;
- quais revelações aconteceram.

### 2.4 Autoridade do backend

O frontend envia comandos e apresenta resultados. O backend decide:

- se o usuário pode executar a ação;
- se um apoio é único;
- se uma aprovação é válida;
- se a condição foi satisfeita;
- se a revelação pode ocorrer;
- como a reputação será atualizada.

### 2.5 Falhar fechado

Configuração incompleta nunca libera conteúdo. Exemplos:

- aprovação sem aprovadores → condição inválida;
- meta menor que 1 → rejeitar;
- data inválida → rejeitar;
- destinatário obrigatório ausente → rejeitar;
- conteúdo protegido ausente → impedir publicação quando o template exigir revelação.

### 2.6 Reputação explicável

Popularidade não é confiança. Seguidores, curtidas, mobilização, realização, frequência e confiabilidade são dimensões separadas.

### 2.7 Evidência sem promessa exagerada

Não usar “imutável”, “100% seguro” ou “100% confiável” sem garantia técnica correspondente. No MVP, preferir `Flexível`, `Comprometida` e `Selada`.

### 2.8 Privacidade desde o desenho

- coletar somente dados necessários;
- localização é opcional;
- conteúdo privado não entra no feed;
- exclusão e anonimização devem ser previstas;
- ações de segurança devem possuir auditoria;
- dados sensíveis não vão para logs.

---

## 3. O QUE O INTENT É E NÃO É

### 3.1 É

- rede social de expectativas;
- motor universal de condições;
- plataforma de participação e mobilização;
- ambiente de revelação condicionada;
- sistema de reputação baseada em comportamento observável;
- registro de acontecimentos e interações.

### 3.2 Não é

- aplicativo de tarefas;
- rastreador de hábitos;
- cofre digital isolado;
- enquete comum;
- crowdfunding obrigatório;
- rede focada apenas em seguidores;
- sistema que promete verificar qualquer fato do mundo sem fonte confiável;
- plataforma de pagamentos no MVP.

---

## 4. VOCABULÁRIO CANÔNICO

| Termo | Significado na interface |
|---|---|
| Intent | Unidade social que descreve o que deve acontecer |
| História | Parte pública que explica a motivação |
| Condição | O que precisa ocorrer |
| Revelação | Conteúdo preparado que ficará disponível após a condição |
| Criador | Pessoa que publica a Intent |
| Apoiador | Pessoa cuja ação conta para uma meta de apoio |
| Participante | Pessoa envolvida formalmente |
| Aprovador | Pessoa autorizada a aprovar |
| Destinatário | Pessoa autorizada a receber a revelação |
| Acompanhar | Inscrever-se para receber atualizações, sem alterar a condição |
| Curtir | Reação social; só conta para a condição quando declarado explicitamente |
| Realizada | Intent cuja condição e resultado foram concluídos |
| Selada | Intent cujos campos protegidos não podem mais ser alterados |
| Histórico | Linha do tempo de eventos relevantes |
| Mobilização | Pessoas únicas que participaram de ações relevantes |
| Confiabilidade | Proporção explicável de Intents avaliáveis realizadas conforme definido |

Evitar na interface: payload, trigger, release, executor, DSL, N_OF_M, commitment, event engine, hybrid condition.

---

## 5. TIPOS DE CONTEÚDO SOCIAL

### 5.1 Publicação comum

Permite conversa espontânea sem condição:

- texto;
- foto;
- vídeo ou link;
- atualização sobre uma Intent;
- opinião.

Publicações mantêm o feed vivo, mas não são Intents e não geram realização.

### 5.2 Intent

Possui pelo menos:

- criador;
- história pública;
- condição;
- audiência;
- estado;
- histórico.

Pode possuir revelação protegida, participantes, apoiadores, aprovadores e destinatários.

### 5.3 Distinção das ações

| Ação | Efeito social | Efeito na condição |
|---|---|---|
| Curtir | Reação | Não, salvo template explícito de curtidas |
| Comentar | Conversa | Não |
| Compartilhar | Distribuição | Não |
| Salvar | Coleção privada | Não |
| Acompanhar | Notificações | Não |
| Apoiar | Compromisso leve | Sim, em condição de apoio |
| Participar | Envolvimento formal | Sim, em condição de participação |
| Aprovar | Autorização formal | Sim, em condição de aprovação |

---

## 6. ESCOPO DO MVP

### 6.1 Incluído

1. Cadastro/login com Firebase Authentication e Google.
2. Perfil próprio e perfil público.
3. Seguidores e seguindo.
4. Feed `Para você`, `Seguindo`, `Amigos` e `Acontecendo agora`.
5. Publicação social simples.
6. Criar Intent por template.
7. Template `Revelar com apoios`.
8. Template `Revelar em uma data`.
9. Template `Palpite protegido` com encerramento manual autorizado no MVP.
10. Template `Aprovação de pessoas` após a primeira fatia de apoios estar estável.
11. Curtir, comentar, compartilhar por link, salvar e acompanhar.
12. Apoio único por usuário.
13. Participação e aprovação únicas quando aplicáveis.
14. Conteúdo de texto, imagem, arquivo ou link protegido.
15. Histórico append-only.
16. Notificações internas.
17. Mensagens privadas simples e compartilhamento de Intent no chat.
18. Minhas Intents.
19. Explorar pessoas, Intents e assuntos.
20. Métricas de perfil e destaques.
21. Rankings por período, categoria e critério.
22. Backend Node.js/TypeScript e PostgreSQL.
23. Implantação em VM Oracle Cloud com Docker Compose.

### 6.2 Preparado no modelo, sem interface completa

- `content_source`: `UPLOAD | MANUAL | LINK | API | WEBHOOK`;
- assinatura de evento externo;
- metadados de origem;
- condições combinadas;
- múltiplas etapas;
- janela de revelação;
- grupos/círculos;
- adaptadores externos.

### 6.3 Fora do MVP

- API pública para parceiros;
- webhooks externos ativos;
- pagamentos;
- chamadas de voz e vídeo;
- transmissão ao vivo;
- blockchain e ZK-Proofs;
- Shamir Secret Sharing;
- Redis, fila externa e microsserviços obrigatórios;
- editor visual de DSL;
- IA generativa dentro do produto;
- aplicativo nativo;
- moderação automatizada sofisticada;
- Intent de Escolha implementada.

---

## 7. FUNCIONALIDADE FUTURA REGISTRADA: INTENT DE ESCOLHA

### 7.1 Intent de Realização

O criador já definiu o resultado e as pessoas ajudam a condição a acontecer.

> Se receber 100 apoios, pintarei meu cabelo de azul.

### 7.2 Intent de Escolha

O criador assume o compromisso, mas as pessoas decidem qual resultado acontecerá.

> Qual cor devo pintar meu cabelo: azul, rosa ou vermelho?

Não é enquete comum. Futuramente poderá incluir:

- prazo;
- mínimo de participantes;
- opções públicas ou ocultas;
- critério de desempate;
- resultado selado;
- prova de realização;
- impacto na reputação se o compromisso não for cumprido;
- voto único e proteção antifraude.

Na criação futura:

```text
Eu já decidi        → pessoas ajudam algo definido a acontecer
Quero que escolham  → pessoas decidem o que acontecerá
```

O modelo futuro deverá suportar `CHOICE`, mas isso não deve atrasar o MVP.

---

## 8. PERSONAS E PERMISSÕES

### 8.1 Visitante

- vê landing e conteúdo público permitido;
- não apoia, comenta ou segue sem autenticação;
- é convidado a entrar ao tentar interagir.

### 8.2 Usuário autenticado

- publica;
- cria Intent;
- segue;
- reage;
- comenta;
- acompanha;
- apoia;
- participa quando autorizado;
- envia mensagens.

### 8.3 Criador

- administra campos permitidos da própria Intent;
- não falsifica apoios, aprovações ou reputação;
- não libera diretamente conteúdo quando a condição não foi satisfeita;
- pode cancelar somente conforme política registrada.

### 8.4 Aprovador

- aprova ou rejeita uma única vez por versão da condição;
- não recebe automaticamente acesso ao conteúdo, salvo se também for destinatário.

### 8.5 Destinatário

- acessa a revelação quando autorizado e disponível;
- não aprova automaticamente.

### 8.6 Moderador/Administrador

- suspende conteúdo e contas;
- trata denúncias;
- não altera silenciosamente a condição ou o resultado;
- toda ação administrativa relevante gera evento de auditoria.

---

## 9. EXPERIÊNCIA E NAVEGAÇÃO

### 9.1 Referência visual oficial

Usar a direção visual aprovada:

- marca `INTENT`;
- fundo claro levemente azulado;
- navy como cor principal;
- cartões brancos arredondados;
- avatares e rostos em destaque;
- barra lateral compacta no desktop;
- perfil resumido na coluna esquerda;
- feed central;
- `Acontecendo agora` no topo;
- coluna direita com destaques, pessoas e assuntos;
- azul para proteção/palpite;
- âmbar para quase acontecendo/apoios;
- verde para realizado;
- roxo para revelado.

Não permitir que cada nova tela reinvente a navegação ou a paleta.

### 9.2 Navegação desktop

- Início;
- Explorar;
- Mensagens;
- Notificações;
- Acontecendo agora;
- Salvos;
- Pessoas;
- botão `+` para criar;
- avatar/perfil.

Ícones compactos devem possuir tooltip, foco visível e indicador de não lidos.

### 9.3 Navegação mobile

Barra inferior:

1. Início;
2. Explorar;
3. Criar;
4. Mensagens;
5. Perfil.

Notificações ficam no cabeçalho.

---

## 10. ESPECIFICAÇÃO DAS TELAS

### 10.1 Landing

Objetivo: explicar em poucos segundos.

- marca Intent;
- pergunta `O que você quer fazer acontecer?`;
- promessa curta;
- demonstração de um card social com condição e revelação;
- `Criar conta`, `Entrar`, `Ver como funciona`;
- evitar “comunidade” como rótulo principal.

### 10.2 Cadastro e login

- Google recomendado;
- e-mail/senha via Firebase, sem senha no banco da aplicação;
- nome, username e aceite de termos;
- onboarding opcional e curto;
- usuário entra no feed antes de ser obrigado a criar.

### 10.3 Feed principal

Coluna esquerda:

- capa, avatar, nome e `@username`;
- seguidores e seguindo;
- atalho para perfil e Minhas Intents.

Centro:

- carrossel `Acontecendo agora`;
- abas `Para você`, `Seguindo`, `Amigos`, `Acontecendo agora`;
- compositor `O que você quer fazer acontecer?`;
- feed de publicações e Intents.

Compositor:

- Criar Intent;
- Fazer palpite;
- Publicar atualização;
- Foto/link.

Coluna direita:

- Destaques do período;
- Em alta;
- Pessoas para acompanhar;
- Assuntos.

### 10.4 Card de Intent

Obrigatório:

- avatar, nome, username e relação;
- data relativa;
- título e história;
- selo do tipo;
- visual do conteúdo protegido quando houver;
- condição em linguagem humana;
- progresso matematicamente consistente;
- pessoas conhecidas envolvidas;
- ação principal contextual;
- curtir, comentar, compartilhar, salvar e acompanhar;
- menu denunciar/ocultar.

### 10.5 Criação rápida

Primeira pergunta:

> O que você quer fazer acontecer?

Templates do MVP:

- Revelar com apoios;
- Fazer um palpite;
- Revelar em uma data;
- Pedir aprovação;
- Privado para pessoas específicas.

Fluxo por apoios:

1. O que será revelado?
2. Quantos apoios precisa?
3. Quem poderá ver?
4. Prévia da frase e card.

Resumo obrigatório:

> Quando 10 pessoas apoiarem, esta foto será revelada publicamente.

Não abrir configurações avançadas por padrão. Rascunho é salvo automaticamente.

### 10.6 Palpite protegido

- texto do palpite;
- evento ou descrição do encerramento;
- horário limite para registrar;
- audiência;
- depois de selado, não pode ser editado;
- no MVP, encerramento pode ser manual pelo criador com confirmação e histórico;
- resultado externo automático fica para adaptadores futuros;
- seguidores podem acompanhar e comentar sem ver o conteúdo;
- após encerramento, conteúdo é revelado.

### 10.7 Detalhe da Intent

Separar:

1. história;
2. condição;
3. progresso;
4. ação contextual;
5. conteúdo protegido/revelado;
6. participantes;
7. comentários;
8. histórico;
9. detalhes de segurança opcionais.

### 10.8 Acontecendo agora

- Intents próximas da realização;
- contagem regressiva calculada no servidor;
- últimas participações;
- “falta 1 apoio”, “falta 1 aprovação”, “revela em 3 minutos”;
- transição visual para `Aconteceu`;
- atualização em tempo quase real por polling no MVP ou Server-Sent Events opcional.

### 10.9 Revelação

Mostrar:

- o que foi prometido;
- quando foi criado e selado;
- condição original;
- momento da satisfação;
- conteúdo revelado;
- verificação de integridade;
- comentários e reações;
- avaliação pós-realização;
- impacto na reputação.

### 10.10 Explorar

- busca por pessoas, Intents e assuntos;
- Intents em destaque;
- quase acontecendo;
- reveladas recentemente;
- criadores confiáveis;
- novos criadores;
- categorias.

### 10.11 Perfil

Cabeçalho:

```text
Rafael @rafael
São Paulo, Brasil · Membro desde maio de 2024
12 Intents · 450 seguidores · 320 seguindo
```

Indicadores:

- Intents realizadas;
- mobilização e variação do período;
- confiabilidade com amostra;
- avaliação média com quantidade;
- curtidas recebidas;
- participações;
- apoios;
- aprovações;
- frequência;
- posições em destaques.

Abas:

- Publicações;
- Intents;
- Realizadas;
- Participações;
- Sobre.

### 10.12 Mensagens

MVP:

- conversa individual;
- texto;
- compartilhamento de Intent;
- indicador de não lida;
- bloqueio e denúncia;
- sem chamadas de voz ou vídeo.

### 10.13 Notificações

- novo seguidor;
- comentário;
- convite;
- apoio;
- progresso relevante;
- condição alcançada;
- revelação;
- mensagem;
- ranking/destaque significativo, com limite anti-spam.

### 10.14 Minhas Intents

Filtros:

- Em andamento;
- Esperando por mim;
- Realizadas;
- Rascunhos;
- Canceladas;
- Arquivadas.

Essa tela é secundária e não substitui o feed.

---

## 11. REPUTAÇÃO, NÍVEIS E DESTAQUES

### 11.1 Dimensões

| Dimensão | Origem |
|---|---|
| Popularidade | seguidores, curtidas, alcance |
| Mobilização | pessoas únicas envolvidas |
| Participação | apoios, participações e aprovações válidas |
| Realização | Intents concluídas conforme definido |
| Confiabilidade | realizadas / encerradas avaliáveis, com regras de elegibilidade |
| Frequência | presença válida ao longo do tempo |
| Avaliação | notas pós-realização |
| Impacto | composição transparente, nunca caixa-preta no MVP |

### 11.2 Confiabilidade

Exibir:

```text
94% de confiabilidade
42 de 45 Intents avaliáveis realizadas conforme definido
```

Não calcular quando a amostra for insuficiente. Exibir `Ainda sem histórico suficiente`.

### 11.3 Mobilização

Contar pessoas únicas que realizaram ações qualificadas. Não somar repetidamente a mesma pessoa dentro da mesma Intent para inflar o número.

### 11.4 Nível

O nível estimula participação, mas não substitui confiança. Ações repetitivas têm limite e peso decrescente. O cálculo deve ser configurável no backend e versionado.

### 11.5 Destaques

Filtros de período:

- Hoje;
- Semana;
- Mês;
- Ano;
- Todo o período.

Filtros de categoria e critério:

- Em alta;
- Mais confiáveis;
- Mais mobilizadores;
- Mais realizados;
- Mais participativos;
- Mais acompanhados;
- Mais curtidos;
- Melhores avaliados;
- Revelações em destaque;
- Novos criadores;
- Subindo agora.

Não usar um único ranking absoluto. Oferecer recortes por categoria, período, região opcional e rede do usuário.

### 11.6 Antifraude básico

- uma ação pontuável por identidade e alvo quando aplicável;
- rate limit;
- contas recém-criadas com peso reduzido em rankings sensíveis;
- exclusão de ações removidas, fraudulentas ou bloqueadas;
- auditoria da versão da fórmula;
- não permitir que o usuário grave seus próprios pontos.

---

## 12. MODELO DE DOMÍNIO TYPESCRIPT

```typescript
export type UUID = string;
export type ISODateTime = string;

export type IntentStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'SEALED'
  | 'SATISFIED'
  | 'REVEALED'
  | 'EXPIRED'
  | 'CANCELLED';

export type IntentTemplate =
  | 'SUPPORT_GOAL'
  | 'LIKE_GOAL'
  | 'TIME_REVEAL'
  | 'PREDICTION'
  | 'APPROVAL'
  | 'PRIVATE_REVEAL';

export type Visibility =
  | 'PUBLIC'
  | 'FOLLOWERS'
  | 'CONNECTIONS'
  | 'SELECTED'
  | 'LINK_ONLY'
  | 'PRIVATE';

export type Condition =
  | { type: 'SUPPORT_COUNT'; target: number }
  | { type: 'LIKE_COUNT'; target: number }
  | { type: 'TIME'; revealAt: ISODateTime; timezone: string }
  | { type: 'APPROVAL'; mode: 'UNANIMOUS' | 'MAJORITY' | 'EXACT_N' | 'PERCENTAGE'; required?: number; percentage?: number }
  | { type: 'MANUAL_EVENT'; label: string; authorizedActorIds: UUID[] };

export type ContentSource = 'UPLOAD' | 'MANUAL' | 'LINK' | 'API' | 'WEBHOOK';

export interface Intent {
  id: UUID;
  creatorId: UUID;
  template: IntentTemplate;
  title: string;
  story: string;
  categoryId?: UUID;
  status: IntentStatus;
  visibility: Visibility;
  condition: Condition;
  protectionLevel: 'FLEXIBLE' | 'COMMITTED' | 'SEALED';
  createdAt: ISODateTime;
  publishedAt?: ISODateTime;
  sealedAt?: ISODateTime;
  satisfiedAt?: ISODateTime;
  revealedAt?: ISODateTime;
  cancelledAt?: ISODateTime;
  version: number;
}

export interface ProtectedContent {
  id: UUID;
  intentId: UUID;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'LINK';
  source: ContentSource;
  cipherText: string;
  iv: string;
  authTag?: string;
  contentHash: string;
  encryptedDataKey: string;
  storageKey?: string;
  revealedAt?: ISODateTime;
  createdAt: ISODateTime;
}

export interface IntentEvent {
  id: UUID;
  intentId: UUID;
  actorId?: UUID;
  type: string;
  occurredAt: ISODateTime;
  receivedAt: ISODateTime;
  idempotencyKey?: string;
  metadata: Record<string, unknown>;
}
```

Regras:

- entidades persistidas usam UUID;
- datas são UTC no banco e convertidas para o timezone do usuário;
- contadores são projeções, não fonte absoluta da verdade;
- condições são discriminadas por `type`;
- dados aninhados duplicados do protótipo antigo não devem ser mantidos como duas fontes de verdade.

---

## 13. MÁQUINA DE ESTADOS

```text
DRAFT → ACTIVE → SEALED → SATISFIED → REVEALED
   │        │        │          │
   └────────┴────────┴──────────→ CANCELLED (quando permitido)
                     └──────────→ EXPIRED
```

### Transições

| De | Comando/Evento | Para | Regra |
|---|---|---|---|
| DRAFT | PUBLISH | ACTIVE | dados e condição válidos |
| ACTIVE | SEAL | SEALED | conteúdo cifrado e compromisso registrado |
| SEALED | CONDITION_SATISFIED | SATISFIED | avaliação no backend |
| SATISFIED | REVEAL | REVEALED | executor idempotente |
| ACTIVE/SEALED | CANCEL | CANCELLED | política permite e ator autorizado |
| SEALED | EXPIRE | EXPIRED | prazo encerrou sem satisfação |

Uma Intent que exige proteção pode realizar `PUBLISH` e `SEAL` na mesma transação lógica.

---

## 14. EVENTOS DE DOMÍNIO

Mínimo:

- `INTENT_CREATED`;
- `INTENT_PUBLISHED`;
- `INTENT_SEALED`;
- `CONTENT_ATTACHED`;
- `INTENT_FOLLOWED`;
- `INTENT_LIKED`;
- `COMMENT_ADDED`;
- `SUPPORT_REGISTERED`;
- `PARTICIPATION_REGISTERED`;
- `APPROVAL_GRANTED`;
- `APPROVAL_DECLINED`;
- `CONDITION_SATISFIED`;
- `REVEAL_STARTED`;
- `CONTENT_REVEALED`;
- `INTENT_EXPIRED`;
- `INTENT_CANCELLED`;
- `RATING_SUBMITTED`;
- `USER_FOLLOWED`;
- `MESSAGE_SENT`.

Eventos são append-only. Correções são novos eventos, nunca edição silenciosa do passado.

---

## 15. BANCO DE DADOS POSTGRESQL

Tabelas mínimas:

- `users`;
- `profiles`;
- `user_follows`;
- `posts`;
- `intents`;
- `intent_conditions`;
- `protected_contents`;
- `intent_members`;
- `intent_follows`;
- `intent_supports`;
- `intent_participations`;
- `intent_approvals`;
- `intent_likes`;
- `comments`;
- `saved_items`;
- `intent_events`;
- `notifications`;
- `conversations`;
- `conversation_members`;
- `messages`;
- `reputation_snapshots`;
- `ratings`;
- `categories`;
- `ranking_snapshots`.

Restrições críticas:

- `UNIQUE(user_id, target_user_id)` em follows;
- `UNIQUE(user_id, intent_id)` em apoio, like, acompanhamento e participação quando a regra for única;
- `UNIQUE(approver_id, intent_id, condition_version)` em aprovação;
- `UNIQUE(idempotency_key)` quando não nulo;
- foreign keys e índices para feed, perfil, condição e notificações;
- transações para ação + evento + atualização de projeção.

Não armazenar arrays gigantes de seguidores, apoiadores ou comentários dentro da linha da Intent.

---

## 16. API INTERNA DO MVP

Prefixo: `/api/v1`.

### Identidade e perfil

- `GET /me`
- `PATCH /me/profile`
- `GET /users/:username`
- `POST /users/:id/follow`
- `DELETE /users/:id/follow`
- `GET /users/:id/followers`
- `GET /users/:id/following`

### Feed e descoberta

- `GET /feed?scope=for-you|following|friends|now&cursor=`
- `GET /explore`
- `GET /search?q=`
- `GET /highlights?period=week&criterion=mobility&category=`

### Publicações

- `POST /posts`
- `DELETE /posts/:id`
- `POST /posts/:id/likes`
- `DELETE /posts/:id/likes`

### Intents

- `POST /intents`
- `GET /intents/:id`
- `PATCH /intents/:id` somente em estados permitidos
- `POST /intents/:id/publish`
- `POST /intents/:id/cancel`
- `POST /intents/:id/follow`
- `DELETE /intents/:id/follow`
- `POST /intents/:id/likes`
- `DELETE /intents/:id/likes`
- `POST /intents/:id/supports`
- `DELETE /intents/:id/supports` somente se política permitir
- `POST /intents/:id/participations`
- `POST /intents/:id/approvals`
- `POST /intents/:id/manual-event`
- `GET /intents/:id/events`
- `GET /intents/:id/reveal`
- `POST /intents/:id/ratings`

### Comentários

- `GET /intents/:id/comments`
- `POST /intents/:id/comments`
- `POST /comments/:id/replies`
- `DELETE /comments/:id`

### Mensagens e notificações

- `GET /notifications`
- `POST /notifications/:id/read`
- `GET /conversations`
- `POST /conversations`
- `GET /conversations/:id/messages`
- `POST /conversations/:id/messages`

Todos os endpoints de escrita aceitam `Idempotency-Key` quando houver risco de repetição.

---

## 17. MOTOR DE CONDIÇÕES E RELEASE ENGINE

### 17.1 Avaliador puro

Recebe estado canônico e retorna decisão, sem gravar no banco:

```typescript
interface EvaluationResult {
  satisfied: boolean;
  reason: string;
  current: number | string | null;
  target: number | string | null;
  evaluatedAt: string;
}
```

### 17.2 Executor

- adquire lock transacional lógico;
- relê o estado;
- avalia novamente;
- verifica se já foi executado;
- grava `CONDITION_SATISFIED`;
- muda estado;
- autoriza revelação;
- grava evento;
- gera notificações;
- atualiza projeções de reputação.

### 17.3 Disparo no MVP

- após cada apoio, like condicional, participação ou aprovação;
- job periódico para condições temporais;
- comando manual autorizado para evento descrito no palpite;
- reconciliação periódica para corrigir projeções.

---

## 18. SEGURANÇA E CRIPTOGRAFIA

### 18.1 Autenticação

- Firebase Authentication;
- frontend envia ID token;
- backend valida com Firebase Admin;
- `firebase_uid` é vinculado ao usuário interno;
- nenhuma senha é salva em `localStorage` ou PostgreSQL.

### 18.2 Autorização

Políticas por operação, não apenas por página. Exemplos:

- somente criador edita rascunho;
- somente aprovador elegível aprova;
- somente destinatário autorizado lê revelação privada;
- criador não escreve contadores;
- usuário não escreve reputação;
- API não aceita `revealedAt`, `satisfiedAt` ou `supportCount` arbitrários.

### 18.3 Envelope encryption do MVP

- gerar chave aleatória por conteúdo;
- cifrar conteúdo com AES-256-GCM;
- cifrar a data key com chave mestra do servidor;
- armazenar chave mestra somente em segredo de ambiente/serviço de segredo;
- armazenar `contentHash` para integridade;
- nunca embutir chave padrão no JavaScript;
- não registrar plaintext;
- preparar migração futura para OCI Vault/KMS.

### 18.4 Upload

- tamanho e MIME permitidos;
- nome gerado pelo servidor;
- armazenamento fora do banco;
- URLs temporárias;
- varredura de malware futura; no MVP, limitar formatos e tamanho;
- impedir execução de HTML/SVG ativo como conteúdo confiável.

### 18.5 Proteções gerais

- HTTPS;
- CORS restritivo;
- rate limit;
- headers de segurança;
- validação com schema;
- queries parametrizadas/ORM;
- escaping de conteúdo;
- proteção CSRF quando aplicável;
- logs estruturados sem segredos;
- backup testado;
- política de retenção.

---

## 19. ARQUITETURA TÉCNICA

### 19.1 Monólito modular

```text
apps/
  web/        React + Vite + TypeScript
  api/        Node.js + TypeScript
packages/
  domain/     entidades, regras e eventos puros
  contracts/  schemas e DTOs compartilhados
  ui/         design system e componentes
infra/
  docker/
  migrations/
```

Módulos backend:

- identity;
- social;
- intents;
- conditions;
- reveal;
- interactions;
- reputation;
- notifications;
- messaging;
- moderation;
- storage.

### 19.2 Stack recomendada

- React 19 + Vite + TypeScript;
- React Router;
- TanStack Query;
- React Hook Form + Zod;
- Tailwind CSS;
- Node.js LTS + Fastify ou NestJS (escolher um e manter consistência);
- PostgreSQL;
- Prisma ou Drizzle;
- Vitest;
- Playwright para fluxos críticos;
- Docker Compose;
- Caddy ou Nginx para TLS e proxy.

### 19.3 Estado no frontend

- servidor é fonte de verdade;
- TanStack Query para cache;
- estado local apenas para interface e rascunhos temporários;
- não persistir dados sensíveis no `localStorage`;
- atualizações otimistas somente para ações reversíveis.

---

## 20. IMPLANTAÇÃO ORACLE CLOUD

MVP em uma VM ARM compatível:

```text
Internet
  → Caddy/Nginx (HTTPS)
    → React estático
    → API Node.js
      → PostgreSQL privado
      → volume de uploads
```

Docker Compose:

- `proxy`;
- `web` ou arquivos estáticos servidos pelo proxy;
- `api`;
- `postgres`;
- job/worker como processo da API ou contêiner separado reutilizando o mesmo código.

Requisitos:

- imagens `linux/arm64`;
- portas públicas apenas 80/443 e SSH restrito;
- PostgreSQL não exposto;
- secrets fora do Git;
- healthchecks;
- restart policy;
- backup criptografado;
- alerta de orçamento;
- ambiente staging opcional local antes da produção.

O Free Tier não deve ser tratado como ambiente com SLA.

---

## 21. MIGRAÇÃO DO PROTÓTIPO ATUAL

### Reaproveitar

- ideias e tipos de condição;
- cálculo de quórum, corrigido para falhar fechado;
- componentes visuais úteis;
- autenticação Google;
- normalização apenas como ferramenta temporária de migração;
- conceitos de conteúdo, participantes e histórico.

### Substituir

- autenticação local e senhas;
- `localStorage` como banco;
- chave criptográfica fixa;
- falsos identificadores de KMS e assinatura;
- autorização no cliente;
- contadores modificáveis;
- arrays de eventos editáveis;
- `IntentManager.tsx` monolítico;
- campos duplicados no topo e em subobjetos;
- simulações misturadas ao código de produção.

### Estratégia

1. criar nova estrutura em branch própria;
2. preservar protótipo como referência;
3. implementar domínio e banco;
4. implementar feed com dados seed;
5. ligar criação rápida ao backend;
6. implementar apoio e revelação reais;
7. migrar telas restantes gradualmente;
8. remover código legado somente após equivalência validada.

---

## 22. REQUISITOS NÃO FUNCIONAIS

- mobile-first;
- acessibilidade WCAG AA como meta;
- foco visível e navegação por teclado;
- respostas de leitura comuns abaixo de 500 ms em condições normais do MVP;
- paginação por cursor;
- operações críticas transacionais;
- datas consistentes em UTC;
- logs com correlation ID;
- health endpoint;
- migrations reproduzíveis;
- backup e restauração documentados;
- zero segredo versionado;
- tratamento de erro em linguagem humana;
- design responsivo sem rolagem horizontal acidental.

---

## 23. CRITÉRIOS DE ACEITAÇÃO DO MVP

### Fluxo social

- usuário cria conta e chega ao feed;
- consegue seguir outra pessoa;
- vê conteúdo de pessoas seguidas;
- curte, comenta, salva e acompanha;
- recebe notificação relevante;
- visualiza perfil e métricas explicadas.

### Apoios

- criador publica revelação com meta 10;
- mesma pessoa não apoia duas vezes;
- curtida não altera apoio;
- progresso deriva de registros reais;
- décimo apoio gera satisfação uma única vez;
- conteúdo é revelado somente após autorização do backend;
- histórico apresenta criação, apoios, satisfação e revelação.

### Palpite

- criador registra e sela texto antes do limite;
- conteúdo não é legível antes da revelação;
- edição é bloqueada depois de selado;
- pessoas acompanham e comentam;
- encerramento autorizado revela uma única vez;
- hash do conteúdo revelado confere.

### Segurança

- nenhum endpoint permite alterar contador ou reputação diretamente;
- usuário não lê Intent privada de outra pessoa;
- aprovador não autorizado é rejeitado;
- token inválido é rejeitado;
- segredos não aparecem no bundle do frontend;
- testes cobrem regras críticas.

---

## 24. TESTES OBRIGATÓRIOS

Unitários:

- todas as condições;
- quóruns, incluindo zero aprovadores;
- transições válidas e inválidas;
- cálculo de confiabilidade;
- mobilização única;
- autorização;
- integridade de conteúdo.

Integração:

- apoio concorrente;
- idempotência;
- décimo apoio;
- revelação;
- follow único;
- aprovação única;
- acesso privado;
- eventos append-only.

E2E:

- cadastro/login;
- feed;
- criar Intent por apoios;
- apoiar com outro usuário;
- revelar;
- comentar;
- abrir notificação;
- visualizar perfil.

---

## 25. DADOS DE DEMONSTRAÇÃO

Seeds devem mostrar o produto real:

1. Palpite Grêmio x Inter protegido até o fim do jogo.
2. Surpresa para a mãe com 8 de 10 apoios.
3. Curso gratuito com 382 de 500 participantes.
4. Documento privado aguardando 2 de 3 aprovações.
5. Mensagem familiar agendada para data futura.
6. Publicações comuns e comentários.
7. Criadores com níveis diferentes de reputação, sem percentuais impossíveis.

Todos os cálculos visuais devem conferir com os números.

---

## 26. ROADMAP APÓS O MVP

### Fase 2

- condições combinadas;
- grupos e círculos;
- janela de revelação;
- moderação ampliada;
- reconciliação e jobs dedicados;
- ranking regional;
- verificação de identidade opcional.

### Fase 3

- adaptadores API/webhook;
- Stripe, GitHub, Strava e fontes externas;
- assinatura de eventos;
- painel institucional;
- storage compatível com S3/OCI Object Storage;
- OCI Vault/KMS.

### Fase 4

- Intent de Escolha;
- votação e compromisso;
- composição entre Intents;
- detecção de ciclos em dependências;
- reputação avançada e causalidade;
- provas criptográficas avançadas quando justificadas.

---

## 27. DEFINITION OF DONE

Uma funcionalidade só está pronta quando:

- critério de aceitação está atendido;
- regra está no backend;
- autorização foi testada;
- possui teste unitário/integrado relevante;
- erros possuem tratamento;
- interface funciona em mobile e desktop;
- acessibilidade básica foi verificada;
- métricas e eventos estão corretos;
- não depende de dados falsos escondidos;
- documentação foi atualizada;
- build e testes passam em CI.

---

## 28. ORDEM RECOMENDADA PARA UMA IA IMPLEMENTAR

1. Criar monorepo e configuração comum.
2. Criar banco e migrations.
3. Implementar autenticação e perfis.
4. Implementar follows e feed com seeds.
5. Implementar design system baseado na referência aprovada.
6. Implementar publicações, likes e comentários.
7. Implementar domínio Intent e máquina de estados.
8. Implementar criação rápida `SUPPORT_GOAL`.
9. Implementar apoio idempotente.
10. Implementar criptografia envelope e revelação.
11. Implementar notificações.
12. Implementar palpite.
13. Implementar aprovação.
14. Implementar métricas e destaques.
15. Implementar mensagens simples.
16. Implementar testes E2E.
17. Criar Docker Compose e guia Oracle.
18. Executar revisão de segurança antes de dados reais.

Não avançar para a próxima grande fase quando os testes críticos da anterior estiverem falhando.

---

## 29. RESUMO CANÔNICO FINAL

O Intent deve parecer uma rede social habitada. Pessoas entram para ver amigos, criadores, expectativas, conversas, rankings e acontecimentos. A criação é simples, baseada em templates e frases humanas. O poder técnico permanece no backend.

O primeiro MVP precisa provar um ciclo:

> Uma pessoa prepara algo, publica uma condição, outras pessoas participam, o sistema verifica o acontecimento, revela o conteúdo e transforma essa realização em reputação pública.

O produto é guiado pela pergunta:

> **O que você quer fazer acontecer?**

E pela tese:

> **O Intent não será somente uma rede onde acontecimentos são criados. Será também uma rede onde as pessoas constroem reputação pública pela capacidade de criar, participar, mobilizar e realizar acontecimentos.**

---

*Intent — Rede Social de Acontecimentos.*
