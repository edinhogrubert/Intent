# Intent — novas funcionalidades e acordos futuros

Fonte canônica de propostas e escopo residual. Transporta acordos do backlog e critérios de avaliação anteriores; não é manifesto operacional nem autorização de implementação. Estado e base em [Status](04_STATUS.md), identidade permanente em [Visão](00_VISAO.md#213-identidade-permanente). Atualizar aqui os acordos de produto; edição exclusivamente documental pode ir à main quando explicitamente solicitada. Não criar issue/branch/PR automaticamente só para registrar ideia, nem implementar por constar neste arquivo.

## 1. Triagem da base e próximos blocos

| Tema | Já entregue na base oficial | O que ainda exige decisão/verificação |
|---|---|---|
|30–34 | Busca/filtros/abas, follows, participação e watch persistido | Não iniciar segunda implementação; avaliar apenas defeito ou escopo novo comprovado |
|35 | Notificações de acontecimentos/watchers, PR43 | Push/e-mail/preferências/agrupamento/tempo real são extensões; confirmar qualquer lacuna específica |
|36 | História da Intent via eventos, PR44 | Resumos na Home, compartilhamento de história e marcos extras exigem benefício/privacidade/evidência; não fabricar retrospectiva |
|37 | Métricas/conquistas objetivas37A, PR48 | Reputação ampliada, mobilização única, confiabilidade, amostra mínima e critérios versionados continuam desenho próprio; sem score fictício |
|38 | Há filtro popular e sinais sociais no feed | Tendências por período/categoria e indicadores objetivos precisam de escopo residual; não ranking absoluto arbitrário |
|39 | Há wizard e opçãoDRAFT/publicação, PR49 | Simplificação/templates/simulador e criação progressiva sem alterar silenciosamente motor |
| Correção de acompanhar | PR47 integrada e viewerWatching nos dois ramos do detalhe | O relato de20/09 não fica como bug aberto automático; nova ocorrência precisa reprodução/evidência atual |

Retirar proposta integralmente concluída somente com evidência de alcance; preservar parte restante e histórico. Não realizar simulação pesada de carga/expansão de infraestrutura agora: adiamento anterior do proprietário permanece até decisão específica.

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

## 2.13 Identidade permanente — endereço canônico

O acordo foi transportado integralmente para [Visão](00_VISAO.md#213-identidade-permanente), por autorização explícita de reorganização14/10/2026. Não removê-lo quando terminar aplicação de terminologia ou limpar backlog. Não duplicar uma versão abreviada que enfraqueça a proteção.

## 3. Possibilidades adicionais preservadas

Recuperação de senha/verificação de e-mail (verificar estado antes de alegar ausência); notificações avançadas além de35; compartilhamento em conversas/mensagens privadas; moderação, denúncia, bloqueio e anonimização/cancelamento de conta; palpite protegido; classificação por assunto/categoria; campanhas e conteúdos adicionais suportados pelo backend. Links básicos de perfil/Intent já foram entregues e não devem reaparecer como tarefa inteiramente nova.

### Visões dos blueprints/protótipo — não aprovadas automaticamente para o MVP vigente

Preservar como possibilidades a refinar: publicações comuns/opiniões separadas da Intent e previsões formais; níveis/destaques/reputação explicável com antifraude, confiabilidade e atribuição causal de convites; descoberta “acontecendo agora” e ranking regional; upload protegido; janela efêmera/expiração; múltiplas etapas, quóruns percentuais/maioria/unanimidade; colaboradores, testemunhas, auditoria e beneficiários; commitment imutável verificável, envelope encryption/DEK/KEK, custódia KMS e rotação; importação/exportação offline de envelope cifrado; threat model e invariantes de segurança; jobs/reconciliação e nextEvaluationAt; eventos externos e dependênciasDAG. Presença desses conceitos no protótipo não certifica implementação no backend atual.

As fases antigasF0–F6 e “etapas1–9” eram planos/avaliações do protótipo, não ordem obrigatória atual. Seus detalhes completos permanecem recuperáveis nos originais vinculados no Histórico. Avaliar código real antes de propor reconstrução, refatoração ampla ou tecnologia alternativa.

Exemplos históricos de demonstração: palpite Grêmio×Inter, surpresa com8/10 apoios, curso382/500, documento2/3 aprovações e mensagem familiar agendada. Não criar dados fictícios em produção, nem usar exemplos como métrica de uso ou prova de funcionalidade.

## 4. Fora do escopo imediato

Sem decisão específica: microserviços/Kubernetes, blockchain/ZK-Proofs, pagamentos integrados, voz/vídeo/transmissão, IA generativa no app, API pública/webhooks ativos, app nativo e reputação complexa sem dados. Isso é delimitação de escopo, não afirmação de impossibilidade técnica. Integrações externas adaptam eventos ao contrato genérico de Intent; não criar SchoolIntent/ContestIntent como bifurcações de domínio.

## 5. Critério de avaliação de ideias — conteúdo preservado

**Propósito:** orientar como pessoas e agentes de IA avaliam propostas antes de aprovar, adaptar, adiar ou não incluir uma ideia. Este documento **não aprova propostas automaticamente, não altera decisões anteriores e não autoriza implementação**. As decisões de produto cabem ao proprietário; os contratos técnicos e operacionais permanecem aplicáveis.

**Abrangência:** propostas do proprietário, sócios, Agente Senior, Agente de Implementação de Laboratório ou outras pessoas e IAs consultadas. Usar o mesmo método para tornar avaliações comparáveis, sem transformar os critérios em pontuações automáticas.

**Origem:** discussão de setembro de 2026 sobre a História da Intent (Bloco 36), especialmente a necessidade de julgar resumos na Home pelo benefício real antes de justificar adiamentos somente por densidade visual ou requisições.

> Uma ideia deve ser avaliada pelo benefício que entrega às pessoas, pela coerência com a identidade do Intent e pelas evidências que sustentam seu funcionamento. O custo técnico entra na decisão, mas não substitui esses critérios.

## Requisitos obrigatórios antes de qualquer aprovação

Privacidade, segurança, autorização, integridade dos acontecimentos e respeito às pessoas são requisitos que não podem ser compensados por potencial de engajamento ou baixo custo. Uma proposta que apresente riscos nesses pontos deve ser adaptada, investigada ou não implementada enquanto não houver solução adequada. Acesso à Intent, aprovação, acompanhamento e acesso a conteúdo protegido são conceitos distintos.

## Critérios de análise, nesta ordem

A ordem orienta o raciocínio; não é uma fórmula rígida nem substitui julgamento contextual.

### 1. Benefício real às pessoas

Pergunta: **a ideia ajuda alguém a compreender, decidir, participar, realizar ou confiar em algo relevante?** Identificar quem se beneficia, em qual situação e qual ação ou compreensão melhora. Informação adicional sem utilidade identificável pode ser ruído, mesmo que seja barata de implementar. Em uma Home, por exemplo, avaliar primeiro se o resumo ajuda a pessoa a decidir participar; avaliar depois apresentação e custo.

### 2. Coerência com a identidade do Intent

Preservar a Intent como protagonista: criar, participar e realizar acontecimentos; distinguir condições, apoio, aprovação, acompanhamento, realização, destinatários e disponibilização de conteúdo. Evitar transformar o produto em feed genérico, ranking competitivo arbitrário ou gamificação vazia. Respeitar integralmente a **seção 2.13 permanente de [Visão](00_VISAO.md#213-identidade-permanente)**, que não pode ser alterada ou removida sem decisão expressa do proprietário. As expressões «Crie. Participe. Realize.» constituem assinatura proposta, não substituição automática do lema vigente «O que você quer fazer acontecer?».

### 3. Evidência de que funciona

Separar hipótese de prova. Indicar dados verificáveis, eventos registrados, testes ou exemplos de produtos comparáveis — estes servem de inspiração, nunca de garantia. Se faltar evidência, propor uma validação pequena antes de ampliar o escopo.

**Integridade histórica:** nunca apresentar como acontecimento passado algo inferido apenas do estado atual. Um marco histórico requer registro contemporâneo ou evidência histórica suficiente, como evento auditável com horário e dados pertinentes. Cálculos derivados de registros históricos confiáveis são permitidos quando explicitam as premissas; a contagem presente, isoladamente, não comprova o percurso anterior. Se faltarem os registros necessários, adiar a apresentação histórica até que existam, sem fabricar retrospectivamente o marco.

### 4. Custo técnico e operacional

Avaliar complexidade, manutenção, infraestrutura, tempo, desempenho e requisições depois de identificar benefício, identidade e evidência. Custo isolado não prova que a ideia seja ruim. Quando a proposta é válida, mas inviável agora, **adiar com uma condição verificável de reavaliação**. Se não oferece benefício ou contradiz princípios essenciais, não incluí-la apenas porque é barata.

## Registro mínimo de uma decisão

```text
Ideia: <nome curto>
Decisão: APROVAR / ADAPTAR / ADIAR / NÃO INCLUIR AGORA
Benefício real: <quem se beneficia e como>
Coerência com a identidade: <princípio reforçado ou tensionado>
Evidência: <o que já sustenta a proposta, hipótese e lacunas>
Privacidade, segurança e integridade: <riscos e condições obrigatórias>
Custo técnico: <impacto quando relevante>
Condição de reavaliação, se adiada: <gatilho verificável>
Responsável e data: <quem decidiu e quando>
```

Uma avaliação registrada não é automaticamente uma tarefa aprovada para execução. Decisões de implementação seguem os procedimentos próprios de arquitetura, branch, PR, testes e implantação, salvo autorização expressa para alterações apenas documentais.

## Sinais de alerta

- Rejeitar ou adiar apenas por custo técnico sem investigar o benefício e a identidade.
- Aprovar somente por parecer interessante ou prometer engajamento sem identificar beneficiários e evidências.
- Reconstituir um marco passado com a contagem atual sem registro histórico confiável.
- Confundir importância funcional de um acontecimento com sua raridade estatística.
- Usar inspiração em outros produtos como prova de que algo funcionará no Intent.
- Tratar concordância rápida entre agentes como validação independente. Procurar objeções e lacunas; discordância, por si só, também não comprova qualidade.
- Compartilhar histórias ou resumos fora da audiência autorizada. Para Intents destinadas a seguidores, ainda é necessário definir explicitamente a política de autorização do compartilhamento antes de implementar; Intents privadas nunca geram resumos públicos automaticamente.

## Valor da avaliação cruzada

Perspectivas diferentes agregam quando revelam riscos, produzem evidências, questionam pressupostos ou refinam a ideia. O objetivo não é criar discordância artificial nem buscar concordância; é melhorar a decisão e registrar o que foi observado, inferido ou deixado em aberto.

## Organização dos novos acordos

Registrar aqui benefício, decisão, evidência, riscos, condição de reavaliação e responsável/data, conforme o critério acima. Uma avaliação não cria tarefa de implementação automaticamente. Não criar nova pasta documental nem mover decisões para fora dos onze documentos canônicos sem orientação do proprietário. Esta regra substitui a antiga previsão de acrescentar arquivos em gestao/; os critérios em si foram preservados.

## 6. Dívidas operacionais identificadas na leitura do código

**Resolvido no código pelo PR51:** propagação de falhas de catálogo (VM5), saúde (VM8/13) e fetch (VM3); bootstrap antigo retirado em favor de instalação do pacote completo por commit aprovado. Não reabrir essas correções como novas tarefas sem reprodução na revisão vigente.

**Ainda não verificado em operação:** instalação efetiva das ferramentas no PC/VM; rotina externa de backup; cópia fora da VM e restauração ensaiada; homologação real do deploy/recuperação. Checksum e catálogo não comprovam restauração. São lacunas de evidência operacional, não prova de falha atual. Confirmar ambiente e escopo antes de agir, conforme Status, Scripts e manual.
