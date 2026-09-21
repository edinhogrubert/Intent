# Critério de Avaliação de Ideias — INTENT

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

Preservar a Intent como protagonista: criar, participar e realizar acontecimentos; distinguir condições, apoio, aprovação, acompanhamento, realização, destinatários e disponibilização de conteúdo. Evitar transformar o produto em feed genérico, ranking competitivo arbitrário ou gamificação vazia. Respeitar integralmente a **seção 2.13 permanente de `ProximasFuncionalidades.md`**, que não pode ser alterada ou removida sem decisão expressa do proprietário. As expressões «Crie. Participe. Realize.» constituem assinatura proposta, não substituição automática do lema vigente «O que você quer fazer acontecer?».

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

## Organização e preservação

A pasta `gestao/` receberá outros documentos **apenas mediante orientação expressa do proprietário, indicando quais, quando e como**. Não mover, renomear, excluir ou reclassificar arquivos existentes por iniciativa deste documento. A diretriz permanente de identidade na seção 2.13 de `ProximasFuncionalidades.md` permanece no local atual até decisão expressa em contrário; mesmo eventual reorganização deve preservar integralmente sua proteção documental e histórico.
