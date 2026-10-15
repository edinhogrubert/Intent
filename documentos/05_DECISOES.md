# Intent — decisões e justificativas

Este registro distingue decisões de produto, implementação verificada e propostas. Não transforma recomendações antigas em requisito novo. Uma decisão substituída permanece rastreável no Git. Para nova ADR, registrar ID, data, contexto, decisão, estado, consequências e referências; não reescrever silenciosamente o porquê anterior.

| ID / estado | Contexto e decisão | Consequências / origem |
|---|---|---|
| D01 — Vigente | Intent é rede social de acontecimentos; intenção, condições, mobilização e realização são protagonistas | Identidade permanente em Visão. Opinião antiga de que “cofre é o produto” é contexto do protótipo, não direção vigente |
| D02 — Implementado | Autoridade no servidor, Express+Prisma+PostgreSQL, identidade Firebase | Cliente não controla autor/contador/realização; sugestões Fastify/NestJS/Drizzle e Firestore/localStorage de blueprints não substituem a implementação |
| D03 — Implementado | Condição e autorização distintas; projeções explícitas | Cumprir meta não torna conteúdo universal. Exigir acesso em recursos ligados à Intent e proteger dados privados inclusive agregados |
| D04 — Implementado com limites | Três condições individuais SUPPORT/DATE/GUARDIANS e visibilidades existentes | Composição DSL e destinatários independentes seguem proposta; DATE avalia na leitura; não prometer scheduler que não está entregue |
| D05 — Implementado | Idempotência persistida, transações e eventos append-only para fatos reais | Replay representa resultado anterior; sem backfill inventado. Não confundir atividade de vínculos atuais com história imutável da Intent |
| D06 — Implementado | Reação/comentário/follow/watch separados de apoio/aprovação | Engajamento social não avança condição por si só. PR38 preserva participação sem entidade paralela |
| D07 — Vigente | Oficial main tem autoridade de integração; intentNew é laboratório | Comparar/adaptar e preservar evolução oficial; origem deve estar acessível. Relatório não prova código publicado |
| D08 — Vigente | Interface numerada única dos executoresPC/VM | Número tem intenção fixa; N/A quando não aplicável; instrução humana usa caminho absoluto. Não criar scripts avulsos desnecessários |
| D09 — Implementado, PR45 | Lista pessoal é atalho privado de seleção, com snapshot individual na Intent | Editar lista não reescreve passado; não transforma lista em grupo social. Novos destinatários exigem escopo próprio |
| D10 — Implementado, PR46 | Criador pode optar por aprovar como guardião, sem aprovação automática | Pode ser único guardião; limite20 inclui autor; autoapoio continua proibido e membro da própria lista permanece outra regra |
| D11 — Implementado, PR47 | Estado do detalhe reconciliado com servidor e proteção a requisições antigas | Falha do GET após mutação não deve ser rotulada como falha certa de escrita; nenhum conteúdo protegido otimista |
| D12 — Implementado, PR48 | Métricas/conquistas37A derivadas de amostra pública segura, sem datas fictícias | Sem score/ranking/confiabilidade; realized/elegíveis com null sem amostra e marcos sem achievedAt |
| D13 — Implementado, PR49 | Rascunho opcional e publicação explícita; fluxo direto continuaPUBLISHED | Privacidade DRAFT e eventoINTENT_PUBLISHED apenas em transição real; nada retroativo; schema não foi refeito |
| D14 — Autorizado14/10/2026 | Consolidar documentação em documentos/, com Agents.md obrigatoriamente na raiz/main e excluir Markdown antigos | Substitui localização de contratos, handoffs e backlog; acordo de identidade preservado literalmente em Visão. Mapa84→novos destinos e originais íntegros no histórico Git |
| D15 — Vigente | Reutilizar evidências de testes pertinentes e registrar revisão/ambiente | Nova execução por mudança, falha, conflito ou check obrigatório; troca de agente não basta para repetir tudo |

## Ambiguidades resolvidas na consolidação

- “Estado atual”/“canônico” em arquivo antigo não prevalece sobre main verificada e decisões posteriores; a visão futura não equivale ao contrato entregue.
- Prompt estável não contém SHA/bloqueio congelado; Status é fotografia datada e fonte de leitura, não autorização automática.
- README de handoffs DRAFT e seus PostgreSQL “pendente” coexistiam com fechamento46/46; manter cronologia como evidência histórica, sem repetir integração já mergeada.
- BackupPC legado ainda citado como função6 em README foi reconciliado com executor atual, que cria bundle internamente. Não reativar auxiliar legado.
- Procedimentos manuais de recuperação são exceção técnica para ação aprovada, pois função15 da VM não automatiza rollback; não apresentar uma funçãoN/A como recuperação completa.
- Fotografias antigas do PC/VM não foram “corrigidas” com versões inventadas. Preservar origem/data e exigir nova inspeção para decidir estado operacional.

## Riscos e decisões que continuam em aberto

Regras de prazo/insucesso, composição, destinatários, storage/KMS, localização, reputação ampliada e descoberta avançada permanecem em [Novas funcionalidades](8_Novas_funcionalidades.md). Não aprová-las implicitamente ao transportar documentação. Custódia de chave no servidor não equivale à promessa de operador incapaz de ler; commitment verificável e proofs avançadas exigem desenho próprio.


## Consolidação operacional de scripts — 2026-10-15 UTC

Adotada entrada única `script/intent.sh` com módulos compartilhados e ações por ambiente; preservar IDs1–15. Instalar conjunto completo de commit aprovado por ativação local atômica. Retirar receitas pessoais duplicadas/SHAs fixos, mantendo origem imutável no catálogo. Manual em script/MANUAL.md é exceção solicitada pelo proprietário à centralização documental.
