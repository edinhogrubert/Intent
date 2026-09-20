# Intent — Próximas funcionalidades e acordos futuros

> **Atualização editorial:** 20 de setembro de 2026. Este arquivo é exclusivamente o backlog de funcionalidades ainda não concluídas e decisões futuras. Não é manifesto de estado operacional, não atesta deploy e não autoriza implementação. O estado oficial, SHA ativo, testes e implantação devem ser consultados no manifesto de continuidade e no GitHub antes de qualquer execução.
>
> **Manutenção:** atualizar este arquivo diretamente na `main` quando houver novo acordo de produto. Quando uma funcionalidade for integralmente implementada e validada, retirar sua proposta concluída daqui, preservando os registros técnicos no histórico do Git e nos documentos operacionais. Se apenas parte estiver pronta, conservar somente a parte pendente e descrever exatamente o limite.
>
> **Identidade:** Intent é uma rede social de acontecimentos. O acontecimento, suas regras, a mobilização e a realização são o centro do produto; não transformar listas de pessoas em comunidades nem confundir apoio, reação, aprovação e acompanhamento. **A seção 2.13 é um princípio permanente de identidade e linguagem, não uma funcionalidade descartável: jamais removê-la na limpeza rotineira do backlog, mesmo após sua aplicação. Qualquer alteração exige decisão explícita do proprietário.**

---

# 1. Próximas entregas previstas — verificar estado antes de executar

O Bloco 34, acompanhamento persistente de Intents, foi concluído anteriormente: não é uma funcionalidade futura e foi retirado deste backlog. Os Blocos 30–33 também não devem ser tratados aqui como tarefas abertas.

- **Bloco 35 — Notificações de acontecimentos:** consolidar entrega para usuários que acompanham Intents, deduplicação, destinatários, privacidade e consistência do contador. A base de notificações, modal, leitura e contador já existia; trabalhar apenas nas lacunas reais. **Não declarar concluído sem relatório, merge e validação.**
- **Bloco 36 — Timeline:** definir e implementar o histórico social de acontecimentos sem inventar eventos.
- **Bloco 37 — Conquistas e reputação:** definir métricas explicáveis, origem verificável, amostra mínima e critérios versionados. Preservar métricas básicas de perfil já existentes; não duplicá-las.
- **Bloco 38 — Tendências e destaques:** período, categoria e indicadores objetivos; não criar ranking absoluto arbitrário nem números fictícios.
- **Bloco 39 — Criação guiada:** simplificar escolhas de condições e participantes sem alterar silenciosamente a semântica do motor.

Estes nomes são planejamento, não prova de que o código atual careça de todos os elementos. Validar no repositório o escopo residual antes de iniciar cada bloco.

---

# 2. Funcionalidades futuras preservadas

## 2.1 Intent de Escolha

A pergunta «O que você quer fazer acontecer?» poderá apresentar dois caminhos: **Eu já decidi**, em que outras pessoas ajudam uma decisão definida a acontecer, e **Quero que escolham**, em que outras pessoas determinam o resultado. Não será enquete comum: exigirá compromisso, prazo, participação mínima, voto único, desempate, resultado e impacto na reputação devidamente especificados.

## 2.2 Intents como guardiãs de outras Intents

Uma Intent poderá depender do estado ou realização de outra. Exemplo: uma liberação institucional exige auditoria técnica concluída e apoio mínimo. Requisitos: grafo acíclico, detecção de dependências circulares, propagação de eventos, reavaliação idempotente, árvore de dependências inteligível e proteção contra cascatas infinitas.

## 2.3 Motor universal e condições avançadas

Compor AND, OR, NOT, N de M, sequência, janela de tempo e múltiplas etapas; considerar fontes manuais e externas, simulador e editor progressivo que não exponha a DSL ao usuário comum. **Não listar novamente as condições individuais por data, apoio ou guardiões como se ainda não existissem**: a lacuna é a composição e suas políticas adicionais, conforme seção 2.12.

## 2.4 Integrações externas

Preservar as fontes conceituais `UPLOAD`, `MANUAL`, `LINK`, `API` e `WEBHOOK`. Ativar API pública e webhooks só com autenticação de serviço, assinatura, idempotência, rate limit e auditoria. Sistemas externos adaptam eventos ao contrato da Intent, não o contrário.

## 2.5 Arquivos, armazenamento e criptografia avançados

Suportar imagens e arquivos protegidos usando OCI Object Storage e URLs temporárias quando aprovado. Evoluções possíveis: OCI Vault/KMS, rotação de chaves, envelopes portáveis, hash chains e provas criptográficas avançadas somente se necessárias. A proteção de texto existente não equivale à entrega destas capacidades.

## 2.6 Jornada do seguidor — boas-vindas e despedida

O criador poderá configurar experiência opcional ao iniciar ou encerrar vínculo: mensagem de boas-vindas, Intent especial, conteúdo exclusivo, recompensa simbólica, cupom/arquivo/link quando suportado ou convite para acompanhar objetivo. Na saída: mensagem respeitosa, resumo opcional, motivo não obrigatório e caminho para voltar.

Regras: não constranger nem dificultar saída; bloqueio, suspensão ou moderação não disparam despedida; requisitos e validade de recompensas claros; não conceder benefícios ilimitados em ciclos seguir/deixar de seguir; elegibilidade por backend, limite por pessoa e período de segurança. Identificar mensagens automáticas e permitir controle de notificações. Eventos futuros candidatos: `WELCOME_JOURNEY_STARTED`, `WELCOME_REWARD_GRANTED` e `FAREWELL_MESSAGE_AVAILABLE`; aproveitar os eventos de seguimento existentes em vez de duplicá-los. Preservar vínculo com acontecimentos, sem virar ferramenta genérica de marketing.

## 2.7 Controle temporal da audiência de seguidores

Além do comportamento básico já existente — seguidores atuais podem acessar Intents antigas destinadas a seguidores — permitir selecionar: (a) somente Intents criadas/publicadas depois do início do vínculo ou (b) somente novos seguidores a partir da publicação. Requisitos: histórico de seguir/deixar de seguir, política temporal por Intent, autorização no backend, regras para seguir novamente, prevenção de ciclos artificiais, prévia inteligível ao criador, testes de feed, link direto e mudanças de vínculo. O comportamento existente permanece padrão até escolha expressa.

## 2.8 Papéis avançados: guardiões, beneficiários e destinatários

Separar **quem aprova** de **quem pode receber/ver** o conteúdo; prever observador autorizado quando necessário. Exemplos: testamento digital, documento aprovado por parte de três pessoas, conteúdo aberto em data para destinatários específicos ou aprovado por guardiões mas entregue a terceiro. Reaproveitar o quórum N de M e os guardiões já existentes; a evolução pendente é a separação de papéis e a combinação segura de regras.

Exigir versão da regra, proteção contra alteração insegura após publicação, resumo prévio de aprovadores/destinatários/prazo, auditoria de aprovação, disponibilização de conteúdo e acesso, autorização no backend e bloqueio de acesso direto indevido. Combinação de data e aprovação relaciona-se à seção 2.12.

## 2.9 Intent por localização

Permitir que a condição dependa de presença em endereço/região, coordenada ou referência com raio configurável. Usos: jogo e pistas, caça ao tesouro, turismo, desafios familiares, eventos presenciais, comércio local, esportes, memórias afetivas, equipes e aulas de campo.

Exigir área aproximada visível antes da publicação; combinação futura com data, guardiões e destinatários; evento de presença com horário, precisão aproximada e versão da regra; geolocalização solicitada só na tentativa de validar, sem rastreamento contínuo; consentimento contextual e possibilidade de recusa sem bloquear o aplicativo inteiro. Validar no backend, considerar erro de GPS, mitigar fraudes sem prometer proteção absoluta, definir tentativas e não expor localização exata desnecessariamente.

## 2.10 Plataforma e operação — somente pendências comprovadas

Reavaliar, com base no manifesto operacional atualizado, publicação por domínio/HTTPS, backup externo, ensaio periódico de restauração, ambiente de staging, observabilidade, alertas, retenção e aplicação mobile futura. **Não classificar CI/CD, Docker, backup local ou health checks como ausentes apenas por constarem em um planejamento antigo.** Não realizar simulação pesada de carga nem expansão de infraestrutura agora; isso foi adiado pelo proprietário para momento de maior consolidação.

## 2.11 Grupos pessoais reutilizáveis — seleção, não comunidade (acordo de 20/09/2026)

**A seleção de listas pessoais como atalhos para guardiões foi implementada na PR #45; os demais papéis dependem de funcionalidade própria.** Grupo é uma lista pessoal reutilizável de pessoas (Futsal, Vôlei, Dança, Família, Trabalho, Escola) para preencher seleções existentes na criação de uma Intent comum. Não possui feed, perfil público, publicação, regra, contador de aprovação ou vida social própria. Criador seleciona nomes ou importa grupos, revisa, adiciona/remove indivíduos e elimina duplicidades. A lista final de aprovadores/destinatários é registrada **na Intent**: alterações posteriores no grupo não modificam Intents anteriores automaticamente. Permissões e validações permanecem no backend e nas regras da Intent; selecionar grupo não concede apoio, aprovação nem participação.

Exemplo: grupo Futsal com 20 pessoas selecionado como aprovadores; a Intent exige 12 de 20 confirmações. Gestão compartilhada da lista seria evolução opcional somente se necessária, sem transformá-la em comunidade.

## 2.12 Políticas de encerramento, prazo e mensagem alternativa (acordo de 20/09/2026)

**Proposta futura; não implementada.** Separar **meta atingida**, **encerramento da participação** e **realização definitiva da Intent**. Criador escolhe política e prazo. Não confundir apoio `SUPPORT` com aprovação `GUARDIANS` e não alterar retroativamente condições existentes.

### A — Encerrar apenas no prazo: futsal

20 aprovadores; mínimo 12; quinta às 18h. Aprovações podem oscilar até o limite, conforme regras explícitas de desistência e reposição. Atingir 12 na quarta é **provisório e não realiza a Intent**. No prazo, congelar pessoas e contagem válidas, avaliar atomicamente; 12 ou mais realiza a Intent e disponibiliza o conteúdo previsto, quando houver; menos de 12 encerra **sem disponibilizar o conteúdo condicionado ao sucesso** e exibe mensagem alternativa do criador («Não vai sair jogo»). Ações tardias não alteram resultado. «Confirmou, pagou» é uma condição informada pelo organizador, não prova de pagamento verificada pela plataforma.

### B — Encerrar imediatamente pela meta: salão de beleza

Primeiros 20 apoios elegíveis reservam 20 brindes até terça. O 20º apoio fecha novas entradas, fixa lista de beneficiários e realiza conforme regra divulgada. Não transferir automaticamente benefício por desistência ou falta; reserva não é entrega. Exibir condições, validade, comparecimento e resultado caso o prazo máximo termine sem atingir meta. Respeitar vagas com operações atômicas, idempotência e concorrência controlada.

### Regras comuns pendentes de especificação

Se prazo termina sem cumprir meta: apenas **mensagem alternativa de insucesso**, jamais conteúdo cifrado original, e estado não realizado. Diferenciar meta provisória, inscrições encerradas, realizado e encerrado sem realização. Definir estados, transições, versão imutável da regra após publicar, compatibilidade legada, auditoria, autorização, fuso/UTC, instante de corte e atrasos do agendador. Determinar quem pode confirmar, retirar confirmação, substituir participantes e visualizar dados. Não presumir pagamento, presença ou entrega sem evento verificável.

## 2.13 IDENTIDADE PERMANENTE — Linguagem própria da Intent (acordo expresso do proprietário em 20/09/2026)

> **PROTEGER ESTE ACORDO. NÃO APAGAR.** Esta seção é uma diretriz permanente de identidade do produto, guardada aqui por solicitação expressa do proprietário mesmo não sendo uma funcionalidade. Não remover quando a terminologia for aplicada nem durante limpezas de backlog, reorganizações ou encerramentos de blocos. Alterar ou excluir somente mediante nova decisão explícita do proprietário. Preservar seu conteúdo no histórico Git e comunicar esta regra a futuros agentes.

**Princípio central:** Intent não é só o nome do aplicativo ou de uma publicação: é o nome que as pessoas devem reconhecer e repetir quando interagem com o produto. A Intent é protagonista, e o vocabulário deve reforçar sua identidade sem sacrificar a compreensão. Pergunta central: **«O que você quer fazer acontecer?»**

**Expressões de ação:** criar uma Intent; participar de uma Intent; apoiar uma Intent; aprovar uma Intent (ação própria do papel de guardião); acompanhar uma Intent; compartilhar uma Intent. Dar preferência ao nome Intent explicitamente nos títulos, mensagens, notificações e conquistas. Botões curtos podem usar só o verbo quando o contexto for evidente.

**Expressões de progresso:** «Minha Intent está avançando.»; «Faltam duas aprovações para realizar esta Intent.»; «A Intent atingiu a meta.»; «Esta Intent aguarda aprovação.» A Intent é o sujeito da história.

**Expressões de resultado:** «Intent realizada» é o estado central; «Você realizou sua primeira Intent.»; «Esta Intent foi realizada com a participação de 20 pessoas.»; «Sua Intent atingiu a meta.»; «O conteúdo desta Intent foi liberado.» Atingir uma meta pode ser provisório e não equivale automaticamente a realizar a Intent: a regra do acontecimento decide.

**Expressões candidatas, sem impor significado artificial:** «conquistar uma Intent» pode ser apropriado para conquistas e reputação, mas não é sinônimo universal de realização; «viver uma Intent» pode representar experiência e participação, desde que receba significado funcional claro antes do uso.

**Assinatura verbal proposta:** **«Crie. Participe. Realize.»** e **«Tudo começa com uma Intent.»** Preservar também a pergunta central do produto; esta assinatura não determina automaticamente substituição do lema vigente.

**Distinções inegociáveis:** apoio, aprovação, participação, acompanhamento, realização, meta e disponibilização de conteúdo são conceitos diferentes. A Intent é maior do que liberar conteúdo: nem toda Intent precisa produzir conteúdo. Evitar em toda linguagem de produto e de interface o termo anteriormente usado para descoberta de conteúdo e suas flexões, por decisão expressa do proprietário; preferir «realização da Intent», «liberar conteúdo» ou «disponibilizar conteúdo» quando cada um corresponder ao fato. Nomes técnicos legados de API, persistência e criptografia requerem auditoria e migração segura de compatibilidade, nunca substituição textual indiscriminada.

**Aplicação futura:** revisar textos de interface, criação guiada, status, timeline, notificações e conquistas conforme seu sentido real, sem presumir que a mudança já esteja implementada. Esta diretriz continua no repositório permanentemente mesmo depois de aplicada.

---

# 3. Outras possibilidades ainda não concluídas

Avaliar conforme necessidade e sem iniciar automaticamente: recuperação de senha e verificação de e-mail (conferir estado atual antes de declarar lacuna); notificações avançadas além do Bloco 35; compartilhamento por link; mensagens privadas e compartilhamento em conversas; moderação/denúncias e bloqueio; palpite protegido; classificação por assunto/categoria e métricas de reputação ainda não entregues; campanhas ou conteúdos adicionais dependentes de suporte real no backend.

Não confundir **acompanhar uma Intent**, **seguir um perfil**, **curtir/reagir**, **apoiar** e **aprovar**. Funcionalidades já implementadas não devem reaparecer aqui como novas tarefas.

---

# 4. Fora do escopo imediato

Não implementar sem decisão específica: microserviços, Kubernetes, blockchain, ZK-Proofs, pagamentos integrados, voz/vídeo, transmissão ao vivo, IA generativa no aplicativo, API pública, webhooks ativos, aplicativo nativo e reputação complexa sem dados suficientes. Essa exclusão é uma decisão de escopo, não uma afirmação de impossibilidade técnica.

---

*Intent — Rede Social de Acontecimentos*  
**Pergunta central:** O que você quer fazer acontecer?
