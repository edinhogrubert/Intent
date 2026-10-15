# Intent — validação e evidências

Critérios funcionais em [Casos de uso](01_CASOS_DE_USO.md) e [Regras](02_REGRAS.md). Este documento define como verificá-los e como registrar evidência, sem transformar resultado antigo em teste do HEAD atual.

## 1. Ambiente e comandos

Fontes: [CI](../.github/workflows/ci.yml), [frontend](../package.json), [backend](../backend/package.json), [config PostgreSQL](../backend/vitest.postgres.config.ts). CI usa Node22, Bun1.4.0 e PostgreSQL15 efêmero; produção foi relatada em PostgreSQL16. Teste em15 não é prova automática de execução em16/VM. PostgreSQL16 descartável foi relatado em integrações posteriores.

Comandos para ambiente de desenvolvimento/CI isolado; ao orientar operação humana normal, usar executor da seção [Scripts](9_scripts.md), sem criar novos scripts só para repetir os comandos:

```bash
# Raiz: instalar pelo lockfile existente
bun install --frozen-lockfile
bun run lint
bun run build
# backend/: dependências e verificações da API
npm ci --no-audit --no-fund
npm run prisma:generate
npm run lint
npm test
npm run build
```

Executar cada grupo no diretório indicado; não executar npm ci do backend na raiz. Raiz não possui script test. Lint é TypeScript, não homologação visual. Algumas suítes backend importam utilitários/componentes reais do frontend e exigem dependências da raiz. Não mudar lockfiles/gerenciadores para fazer check passar.

PostgreSQL real, no backend: definir TEST_DATABASE_URL para conexão **descartável** com hostlocalhost ou127.0.0.1 e banco `intent_test_<sufixo>` de letras minúsculas/dígitos/underscore; então executar `npm run test:postgres`. Configuração rejeita host/banco fora desse padrão e não usa DATABASE_URL de produção como fallback. Aplica migrations e cria fixtures/triggers; não usar banco de desenvolvimento compartilhado, staging ou VM. Descartar ambiente ao concluir. Não imprimir conexão real com senha.

## 2. Matriz por mudança

| Mudança | Verificação pertinente |
|---|---|
| Documentação | Todos os caminhos de destino, links relativos/âncoras, origem de afirmações, preservação de acordos, inexistência de Markdown antigo e diff-check |
| Caminhos em executores | Bash -n, função9 em fixture isolada positiva e ausência de cada arquivo como cenário negativo; confirmar que não executa funções de produção |
| Texto/referência em componente | TypeScript e build frontend; comparar diff para ausência de mudança de lógica |
| Regras/serviços/API | Suítes direcionadas e regressões afetadas; ampliar conforme riscos e checks obrigatórios |
| Schema/migration/constraints/concorrência | PostgreSQL real descartável, cadeia íntegra e autorização de acesso; nunca produção para teste |
| Navegação/autenticação/UX | Componente/harness e homologação autenticada real quando necessária; fixture não é sessão real |
| Deploy | Evidência própria de commit/imagens/migrations/backup/health/rede e fluxos essenciais; main alinhada não prova imagem em execução |

## 3. Registro mínimo e reaproveitamento

Registrar comando, resultado, data/fuso, repo/branch/commit ou diff validado, ambiente/versão, executante/fonte e limites. Distinguir executado nesta sessão, log/CI inspecionado e apenas relatado. PASS unitário, PostgreSQL, navegador sintético e login real não são a mesma evidência.

Reaproveitar validação quando revisão, escopo e ambiente permanecem pertinentes. Reexecutar por mudança material, conflito de reaplicação, ambiente diferente relevante, falha, evidência insuficiente ou requisito do repositório. Não repetir suíte completa por troca de agente; cumprir CI obrigatório sem chamá-lo de homologação da VM.

## 4. Evidências históricas preservadas

Os números abaixo vêm dos relatórios originais identificados no [mapa de Histórico](07_HISTORICO.md), descrições de PR e relatos anteriores explicitamente identificados. Não foram reexecutados por esta descrição. Não somar testes direcionados aos totais quando já fazem parte da suíte.

| Entrega / base | Registro anterior | Limite declarado |
|---|---|---|
| Autoridade/idempotênciaF0, PR4 |86 simulados e22 PostgreSQL | Registro da etapa antiga, não total do produto atual |
| Reações13 |36 PostgreSQL15, incluindo7 de reações | Runtime16 devia ser reconfirmado antes daquele deploy |
| Bloco20, mvp1.0.18/25e688a |192 backend/10suítes; lint/build e Prisma6.19 | Sem PostgreSQL real/login/homologação visual/deploy nessa entrega |
| Bloco21, mvp1.0.19/7ea9d7a |210 backend; harness Chrome de follow/listas/isolamento | Fixtures sintéticas; sem VM/PostgreSQL real |
| Bloco22, mvp1.0.20/a075ec5 |214 backend; Chrome/TypeScript/build | Privacidade das queries e UI com fixtures; sem teste de carga/VM |
| Bloco23, mvp1.0.21/ee06018 |217 backend; Chrome/feed/paginação | Doubles não certificam custo/resultado PostgreSQL real |
| Bloco24, base7fc87c2 |237 backend e39 PostgreSQL16 efêmero |60 eventos empatados em banco e120 no serviço; sem login/homologação/benchmark |
| Bloco25A, base4cbdc3a |264 backend, incluindo27 de links;39 PostgreSQL16 | Destino sem login observado, pós-login/clipboard real pendentes; simulação de histórico não éE2E |
| Bloco25B/C no handoff intermediário | Laboratório relata26 edição e12 atividade; assistente GitHub não executou localmente | Não aceitar esses números como execução do integrador; estado posterior consta no Git |
| Fechamento25 em continuidade |300 backend;83 direcionados,27 links/26edição/20atividade; lint/build/diff | Relato posterior de correção da race condition; homologações autenticadas ainda distintas |
| Bloco37A | PR48 relata330 backend PASS e PostgreSQL pendente; houve relato posterior de46 PostgreSQL e110 direcionados | A PR foi consultada; o relato posterior não foi revalidado por log nesta consolidação |
| DRAFT, branchfeat/intent-draft-publish/headaa658616 |344 backend/20arquivos,122 direcionados,46 PostgreSQL16/13migrations; lint/build/diff | Relatado na PR49 e fechamento do handoff; pendência anterior de PostgreSQL foi superada nesse registro |

### Regressões críticas que não podem desaparecer

Autoria autenticada; acesso PRIVATE/FOLLOWERS/guardiões/DRAFT; criador não apoia; autor pode aprovar somente se selecionado; única aprovação/reação/watch/follow; idempotência/replay/concorrência; transação sem efeito parcial; projeção sem segredos; métricas exclusivamente públicas; cursor com empates sem perda; resposta antiga descartada; falha de GET após mutação sem erro enganoso; sem liberação otimista; listas não reescrevem snapshots; história baseada em eventos reais.

### Homologação manual quando pertinente

Contas autorizadas de teste: entrar/sair e reabrir link pelo login; criar publicada/rascunho e publicar; apoiar/retirar/atingir meta com outra conta; guardião autor/externo com quórum; conteúdo inacessível antes da condição; seguir/desseguir altera autorização; acompanhar aparece corretamente no detalhe/reload; comentário/reação independentes; abrir notificação; filtros/Carregar mais/troca rápida; copiar link com recusa de clipboard; layout desktop/mobile e teclado. Restaurar dado antigo exige validar chave correspondente e login Firebase separadamente. Registrar não executado quando faltar sessão/ambiente.

## 5. Validação da consolidação documental

O conjunto a verificar inclui:84 origens com destino/justificativa e SHA recuperável; identidade2.13 literal; critérios de avaliação preservados; propostas futuras transportadas; exatamente11 Markdown na árvore versionada; função9PC/VM apontando para todos os onze; ausência de referências operacionais a caminhos apagados; snapshots antigos identificados como históricos. Scripts históricos e código arquivado podem conter nomes antigos como registro, sem virarem dependência operacional ativa.

Resultados reais desta alteração ficam no relatório de execução/PR e no fechamento do Histórico. Não antecipar PASS de CI, teste ou publicação neste arquivo. Não repetir testes de domínio/banco só para mudar Markdown; CI do repositório continua aplicável.


### Resultados executados nesta consolidação

| Verificação local em 14/10/2026 | Resultado / limite |
|---|---|
| Inventário e cobertura | 84 origens, 74 blobs distintos, 84 originais recuperáveis e destinos existentes |
| Preservação | Identidade 2.13 literal; acordos 2.1–2.12 e critério de avaliação de ideias conferidos por comparação de conteúdo |
| Estrutura e links | Onze Markdown canônicos; 380 links conferidos, incluindo os 84 originais imutáveis; nenhuma referência operacional ativa a caminho apagado |
| Executores | 26 cenários em fixtures temporárias: sucesso, ausência individual de cada um dos onze documentos e listagem em PC/VM; sem acesso a PC/VM reais |
| Sintaxe Bash | Sete scripts atuais de executores/instalação/deploy aprovados em bash -n |
| Frontend | bun install --frozen-lockfile, bun run lint e bun run build aprovados; Bun1.4.0, Node24.19.0 local, Vite6.4.3; dependências/lockfiles sem alteração versionada |
| Diff | git diff --cached --check aprovado; alterações não documentais limitadas às referências e retorno descritos no Histórico |

A primeira execução funcional identificou que summary do PC retornava1 quando a última função da lista não tinha resultado, mesmo após função9 com OK. Acrescentado retorno0 explícito ao resumo, preservando o rc acumulado do dispatcher e falhas reais. Os cenários acima foram aprovados após a correção. Não confundir esse defeito preexistente com efeito da mudança de caminhos.

Backend e PostgreSQL não foram reexecutados localmente: não houve alteração de domínio, schema ou migrations. CI da PR/main é evidência separada a consultar no GitHub; estes resultados locais não antecipam seu desfecho nem homologação de produção.


## Consolidação operacional de scripts — 2026-10-15 UTC

Alterações shell: executar `bash script/testes/validar.sh`; cobre sintaxe de todos os SH e contratos simulados sem serviços reais. Não confundir simulação com implantação/recuperação homologada. PC8 usa clone descartável. CI de aplicação permanece obrigatório; não repetir localmente suítes de aplicação sem delta pertinente.
