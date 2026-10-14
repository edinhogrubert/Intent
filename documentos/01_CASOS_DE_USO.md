# Intent — casos de uso e critérios de aceitação

Referência: código da base de produto identificada em [Status](04_STATUS.md). Critérios descrevem o comportamento a verificar; não são resultados de testes executados nesta consolidação. Estratégia e evidências em [Testes](06_TESTES.md), regras em [Regras](02_REGRAS.md).

| Caso | Ator / pré-condição | Fluxo e resultado esperado | Exceções e aceite essencial |
|---|---|---|---|
| UC01 — Entrar e sincronizar perfil | Conta Firebase válida | Cliente obtém token; API valida e sincroniza usuário PostgreSQL; sessão pode consultar o próprio perfil | Token inválido/conta suspensa não pode executar escrita protegida; identidade não vem do body |
| UC02 — Consultar feed e detalhe | Visitante ou autenticado conforme rota/visibilidade | Feed público lista Intents publicadas/realizadas; detalhe aplica autorização própria; UI abre recurso real | PRIVATE/FOLLOWERS não vazam; DRAFT é exclusivo do criador; perfil público requer autenticação mesmo tendo nome público |
| UC03 — Criar Intent | Usuário autenticado ativo | Informar título, história, categoria, condição, visibilidade e conteúdo protegido; publicar diretamente por padrão | Validar limites, meta/data/quórum e guardiões ativos; payload extra rejeitado; PRIVATE com SUPPORT recusado |
| UC04 — Preparar e publicar rascunho | Criador autenticado | Escolher salvar como DRAFT; consultar em Minhas Intents; publicar explicitamente | Antes de publicar: publishedAt nulo, sem feed/busca/interações; somente criador publica; reenvio não duplica publicação/evento |
| UC05 — Apoiar e retirar | Pessoa diferente do criador, com acesso à Intent SUPPORT aberta | Apoio único incrementa progresso; pode retirar antes da realização; meta realiza uma vez | Reação não é apoio; criador não apoia; concorrência não duplica vínculo/evento; não retirar após realização |
| UC06 — Aprovar como guardião | Selecionado em GUARDIANS publicada | Clique explícito registra aprovação única; quórum realiza; autor pode incluir a si mesmo explicitamente | Criar não aprova; limite20 inclui autor; não selecionado não aprova; contagem verdadeira sem divulgar IDs a quem não pode vê-los |
| UC07 — Realizar por data e acessar conteúdo | Pessoa autorizada | Após data, leitura do detalhe pode efetivar realização e retornar conteúdo autorizado | Comportamento atual é avaliação na leitura; não prometer agendador pontual. Condição e autorização são verificações distintas |
| UC08 — Reagir/comentar | Pessoa autenticada com acesso | LIKE/LOVE/CELEBRATE, troca/remoção e comentário1–500 caracteres | Uma reação por usuário/Intent; ações não avançam meta; DRAFT bloqueia; campos privados não entram na projeção |
| UC09 — Seguir e consultar conexões | Pessoas autenticadas ativas | Seguir/deixar de seguir; listas paginadas; acesso FOLLOWERS depende do vínculo vigente | Sem auto-follow ou duplicação; remover vínculo retira autorização correspondente; acompanhar Intent é outro vínculo |
| UC10 — Consultar/editar perfil | Usuário autenticado; edição somente própria | Nome/bio/avatar, métricas públicas, atividade e histórico de Intents; edição atualiza sessão/UI | Não aceitar edição de autoridade; não expor atividade PRIVATE/FOLLOWERS nas métricas públicas, mesmo no próprio perfil |
| UC11 — Buscar | Usuário autenticado | Buscar Intents/pessoas, abas kind, filtros de estado/período e paginação da aba | q2–80; limites1–20; cursor opaco, compatível com aba/filtros; revalidar acesso no detalhe |
| UC12 — Acompanhar | Usuário autenticado com acesso | Acompanhar/deixar de acompanhar de forma persistente; listar acompanhadas acessíveis | Idempotência e unicidade; não avança condição; DRAFT não pode ser acompanhado; estado do detalhe reflete servidor |
| UC13 — Receber/ler notificação | Destinatário autenticado | Sino/contador, lista, filtros locais, leitura individual/em massa e abertura da Intent quando disponível | Sem leitura de notificação alheia; badge muda após sucesso; se perdeu acesso, listagem remove resumo da Intent; não prometer push/tempo real |
| UC14 — Consultar história da Intent | Usuário autenticado com acesso | Listar eventos reais paginados de criação/publicação/apoios/aprovações/realização | Nenhum backfill inventado; retornar id/tipo/horário sem payload/ator; revalidar acesso a cada página |
| UC15 — Usar listas pessoais | Proprietário autenticado | Criar/renomear/excluir lista e adicionar/remover usuários ativos; importar listas na seleção de guardiões | Só o dono acessa; deduplicar UUIDs; snapshot individual na Intent não muda ao editar lista; proprietário não é membro da própria lista, mas pode se incluir como guardião por opção separada |
| UC16 — Compartilhar e navegar | Usuário conforme autorização do destino | Gerar links query de perfil/Intent, preservar destino no login e histórico de navegação | Link contém identificador, não autorização; sem prometer suporte a aliases de caminho descartados; clipboard pode falhar com feedback |

## Cenários transversais

Para cada alteração pertinente, cobrir conta inativa, outro usuário, UUID inválido/inexistente, erro de rede, envio repetido, concorrência e resposta antiga após troca de recurso/filtro. Mutação confirmada seguida de falha de leitura deve ser apresentada como falha de sincronização, não como certeza de que a escrita falhou. Não exibir conteúdo protegido otimisticamente.

Critérios de aceitação pertencem aqui e às regras específicas. Testes devem referenciá-los; não duplicar narrativas completas em cada entrega. Uma homologação manual pendente deve permanecer pendente até evidência real.
