# Intent — como trabalhar neste repositório

Este arquivo fica **na raiz do repositório e na branch main**, por decisão expressa do proprietário. Respeitar a grafia `Agents.md`. A documentação canônica está em `documentos/`, com exceção expressamente autorizada do manual operacional `script/MANUAL.md`; não criar cópias, README paralelos nem novos handoffs Markdown espalhados. A consolidação substitui os antigos contratos, roadmaps e pacotes de continuidade, conforme o mapa em [Histórico](documentos/07_HISTORICO.md).

## Mapa e leitura por tarefa

| Pergunta | Documento |
|---|---|
| O que é o produto, para quem e qual identidade preservar? | [00 — Visão](documentos/00_VISAO.md) |
| O que o usuário faz e como aceitar o resultado? | [01 — Casos de uso](documentos/01_CASOS_DE_USO.md) |
| Quais comportamentos e permissões devem ser preservados? | [02 — Regras](documentos/02_REGRAS.md) |
| Como o código e os ambientes são construídos? | [03 — Arquitetura](documentos/03_ARQUITETURA.md) |
| Qual estado foi verificado e o que ainda falta verificar? | [04 — Status](documentos/04_STATUS.md) |
| Por que adotamos uma decisão? | [05 — Decisões](documentos/05_DECISOES.md) |
| Como validar sem retrabalho? | [06 — Testes](documentos/06_TESTES.md) |
| O que mudou e de onde veio cada documento antigo? | [07 — Histórico](documentos/07_HISTORICO.md) |
| O que ainda é proposta ou funcionalidade futura? | [8 — Novas funcionalidades](documentos/8_Novas_funcionalidades.md) |
| Quais scripts existem e como operá-los? | [9 — Scripts](documentos/9_scripts.md) |

Ler este arquivo primeiro e somente os documentos pertinentes à tarefa. Ao retomar desenvolvimento, consultar Status e estado remoto vigente antes de escolher bloco. Não carregar todo o histórico para toda mudança.

## Autoridade, evidência e autorização

- Oficial: `edinhogrubert/Intent`, main. `edinhogrubert/intentNew` é laboratório. Conferir remoto, branch, HEAD, diferenças locais, PR e referências remotas atualizadas antes de integrar. Não inferir que commit local foi publicado.
- Instruções explícitas atuais do proprietário definem o escopo autorizado. Regras estáveis ficam aqui e em Regras/Decisões; implementação efetiva deve ser conferida no código. Divergência entre regra desejada e código é uma lacuna, nunca licença para inventar implementação ou sobrescrever evolução recente.
- Distinguir **CONFIRMADO** (evidência inspecionada, fonte/data/revisão), **RELATADO** (autor e origem), **PROPOSTO** (ação futura), **HISTÓRICO** (baseline anterior) e **NÃO VERIFICADO/BLOQUEADO** (lacuna e resolução).
- Separar laboratório, checkout do agente, main remota, PC do proprietário e VM. Implementado, testado, integrado, mergeado, tagueado, implantado e homologado são estados diferentes.
- Não declarar testes, CI, saúde, backup ou deploy sem evidência. Consultar apenas a superfície necessária; se não houver acesso, registrar a lacuna e continuar trabalho independente.
- Mudanças de código seguem branch/PR e checks pertinentes. Atualizações exclusivamente documentais podem ir diretamente à main quando solicitadas. Não realizar merge, tag/release, deploy, rollback, alteração de VM, migração de produção ou exclusão fora do escopo sem autorização aplicável da sessão; não pedir novamente autorização já dada.
- Preservar PostgreSQL, autenticação Firebase, autoridade do backend, privacidade e integridade histórica. Não importar mocks/localStorage, adaptações Cloud SQL ou infraestrutura do laboratório como produção.
- Identidade permanente: [Visão, seção 2.13](documentos/00_VISAO.md#213-identidade-permanente). O conteúdo original foi transportado integralmente por autorização de reorganização e não pode desaparecer na limpeza do backlog.

## Papéis e fluxo por blocos

Coordenador: definir contrato, conferir fontes, revisar retornos e preparar o próximo passo. Agente de laboratório: implementar/testar em intentNew e fornecer branch/commit publicado ou patch acessível. Integrador oficial: comparar com main vigente, adaptar cirurgicamente, preservar contratos, regressões e trabalho existente. Executor de validação: executar o escopo autorizado e relatar efeitos e resultados.

Antes de reaplicar, confirmar que origem e base existem; se faltarem, obter patch/publicação verificável. Não reconstruir uma suposta entrega apenas por resumo. Não reimplementar bloco já entregue nem expandir escopo por gosto. Finalizar o bloco e registrar seu estado antes do próximo ciclo. Neste repositório, registrar o handoff ativo em Status, comportamento em Regras/Casos e resultado histórico em Histórico, sem novo arquivo por agente ou bloco.

Formato mínimo de handoff:

```text
Objetivo/bloco e destinatário técnico:
Estado: CONCLUÍDO / PARCIAL / BLOQUEADO (indicar em qual superfície)
Repo, branch, commit-base, commit-final, versão/tag e PR/URL/status (se disponíveis):
Fonte e data da confirmação; relatos e propostas separados:
Arquivos alterados; backend/frontend/API/Prisma/migration afetados:
O que foi reaproveitado, adaptado ou descartado e motivo:
Testes: comando, ambiente, revisão validada, resultado e origem da evidência:
Riscos, pendências e ação seguinte com responsável/critério de aceite:
Merge, release, PC e deploy/VM: informar separadamente, sem presumir:
```

## Operação e manutenção

Entrada operacional consolidada: `script/intent.sh`; instalação por pacote completo em `script/instalar.sh`. Consultar [manual](script/MANUAL.md) e catálogo antes de operar. Wrappers antigos são transitórios e exigem checkout completo.

Usar funções existentes dos executores com ambiente e caminho absoluto, conforme [Scripts](documentos/9_scripts.md). Não entregar chamadas abstratas PC(...)/VM(...) como comando final, inventar números nem criar script avulso se uma função existente atende. Bootstrap versionado é exceção documentada; comandos de diagnóstico internos do agente não precisam virar novo script de operação humana.

Reaproveitar validações aplicáveis à mesma revisão/escopo/ambiente; executar novamente somente por mudança relevante, conflito, falha, lacuna ou check obrigatório. Não repetir suítes apenas pela troca de agente. Testes de laboratório não certificam adaptação diferente nem produção.

Atualizar o documento dono do assunto no mesmo trabalho que altera o contrato. Mudança de arquitetura deve declarar PC/VM sem mudança ou indicar as seções alteradas de Arquitetura. Não duplicar snapshots em prompts. Não registrar segredo, dump, credencial administrativa, token, sessão ou conteúdo privado no Git. Scripts novos precisam de registro em Scripts e integração à função apropriada.

Gatilhos humanos preservados: `#Retomar projeto Intent#` e `#Pausar projeto Intent#` retomam/pausam desenvolvimento; `#Retomar projeto jira#` e `#Pausar projeto jira#` retomam/pausam apoio ao Jira/Confluence. Retomar não autoriza operação de produção por si só.
