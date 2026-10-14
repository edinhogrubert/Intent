# Intent — visão do produto

## 1. Objetivo, público e limites

Intent é uma **rede social de acontecimentos**. Uma pessoa cria algo que quer fazer acontecer, define uma condição e convida outras pessoas a participar; o backend verifica a condição, registra fatos e realiza a Intent. Conteúdo protegido pode ser disponibilizado conforme as autorizações. A Intent é maior que a liberação de conteúdo: não reduzir o produto a cofre, metas, enquete, tarefas ou feed genérico.

Pergunta central: **O que você quer fazer acontecer?** A assinatura **Crie. Participe. Realize.** é proposta de linguagem, sem substituição automática da pergunta central.

Público: pessoas e organizadores que mobilizam acontecimentos sociais, esportivos, familiares, profissionais e de aprendizado; uso institucional é uma possibilidade, não um domínio especializado separado. Exemplos de produto incluem encontro com confirmações, mensagem para data futura e documento condicionado a aprovações. Exemplos não garantem que combinações avançadas de prazo, destinatários ou pagamento já existam.

O diferencial é conectar intenção, condição, participação e realização verificável. Reputação deve derivar de ações reais, métricas explicáveis e privacidade; não usar números fictícios ou gamificação sem fundamento.

## 2. Conceitos e experiência

| Conceito | Significado |
|---|---|
| Criar | Registrar uma Intent e suas condições |
| Apoiar | Contribuir para uma meta SUPPORT; o criador não apoia a própria Intent |
| Aprovar | Ação voluntária/autenticada de guardião selecionado, distinta de criar |
| Participar | Conceito de produto; não inventar entidade ou contador paralelo sem contrato |
| Acompanhar | Manter vínculo pessoal com uma Intent; não avança condição |
| Seguir | Manter relação com outro perfil; não é acompanhar uma Intent |
| Reagir/comentar | Interação social que não substitui apoio nem aprovação |
| Realizar | Resultado definido pela regra do acontecimento e confirmado pelo backend |
| Receber conteúdo | Acesso autorizado; não se confunde com aprovar ou tornar público |

Preservar interface em português, linguagem humana, simplicidade progressiva, navegação responsiva e acessível, estados de carregamento/erro/vazio e ações que tenham efeito real. O usuário comum não precisa manipular DSL ou termos de implementação.

## 3. Produto pretendido e produto implementado

Casos de uso e Regras descrevem a base inspecionada; Status registra alcance das evidências. O MVP implementado usa condições individuais SUPPORT, DATE e GUARDIANS, visibilidades PUBLIC/FOLLOWERS/PRIVATE e publicação direta ou rascunho opcional. Não afirmar que todo o blueprint antigo de produto foi entregue.

A visão histórica inclui publicações comuns, palpites protegidos, mensagens, descoberta ampla, reputação, destinatários independentes, criação por templates e condições compostas. Preservar essas possibilidades em [Novas funcionalidades](8_Novas_funcionalidades.md), com validação e decisão próprias. Perfis de teste, modelos antigos e telas arquivadas não certificam capacidades de produção.

Fora do escopo imediato sem decisão específica: microserviços, Kubernetes, blockchain, ZK-Proofs, pagamentos, áudio/vídeo, transmissões, IA generativa no app, API pública/webhooks ativos, app nativo e reputação complexa sem evidências. O backend vigente é Express/Prisma/PostgreSQL; sugestões antigas de Fastify/NestJS/Drizzle não autorizam sua substituição.

## Preservação da identidade

A seção abaixo foi transferida literalmente do acordo de 20/09/2026, anteriormente no backlog, para esta referência permanente. Sua proteção continua válida; a reorganização de 14/10/2026 alterou o endereço, não o conteúdo nem sua força. A âncora estável é `213-identidade-permanente`.

<a id="213-identidade-permanente"></a>


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
