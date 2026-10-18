# Intent — estado verificado e continuidade

## Referência desta atualização

Conferência: 15/10/2026, America/Sao_Paulo. Repositório oficial `edinhogrubert/Intent`, branch `main`. Última integração funcional/documental conferida: `4a140976c4d88424c31787183c389a1a0f969702`, merge do [PR51](https://github.com/edinhogrubert/Intent/pull/51), implementação `3a78d9075f547f4a727802095a661352318f29f0`, branch de origem `refactor/scripts-consolidados`.

**Organização concluída e integrada:** [PR50](https://github.com/edinhogrubert/Intent/pull/50) consolidou a documentação; PR51 consolidou os scripts. Ambos mergeados. [CI pós-merge do PR51](https://github.com/edinhogrubert/Intent/actions/runs/38671990885): Frontend, Backend e Scripts Oracle aprovados. Este fechamento documental acrescenta um commit posterior; seu identificador é consultável no Git, sem tentar registrar o próprio hash dentro do arquivo. Antes de nova ação, conferir HEAD remoto.

Fonte de leitura: `Agents.md` na raiz → este Status para continuidade → documento pertinente em `documentos/`. Manual operacional autorizado em `script/MANUAL.md`. Não usar contratos, handoffs ou arquivos pessoais removidos como instrução vigente. A base de produto documentada é historicamente o merge PR49 `df02be79afaefd300e4106ecec0be0313ddb39f0`; não confundir essa base com HEAD atual.

## Matriz de confirmação

| Superfície | Evidência / estado |
|---|---|
| GitHub oficial | Main consultada na API; PR50/51 mergeados. Árvore atual com12 Markdown: Agents.md, dez em documentos/ e script/MANUAL.md. Os84 Markdown antigos são histórico recuperável no Git |
| Checkout do agente | Main sincronizada à integração conferida, árvore limpa antes deste fechamento documental; não é PC do proprietário |
| PRs26,38,40,43,45–49 | Merge confirmado pela API GitHub; PR44 e demais entregas também constam do histórico Git |
| Versão/tag | Clone remoto contém tags mvp-1.0.0 até mvp-1.0.23; não foi confirmada release1.0.24 implantada. Tag não equivale à versão servida; src/appVersion.ts ainda contém o label histórico mvp-1.0.4-pr5/PR5, que não é evidência de release atual |
| PC do proprietário | Sem acesso nesta tarefa; sincronização, instalação dos executores e estado local não verificados |
| VM / produção | Sem acesso nesta tarefa; commit efetivo, imagens, migrations aplicadas, backup, portas e saúde atuais não verificados |
| Laboratório intentNew | Não consultado nesta tarefa; não é autoridade sobre o oficial |
| Homologação funcional | Não realizada nesta consolidação; relatos anteriores não se tornam execução atual |

## Entregas confirmadas no código oficial

| Entrega | Referência de integração | Limite |
|---|---|---|
| Links, edição e filtros de atividade25A/B/C | PR26/ac3fb24828607940d611a4704c09dc08b0401acf | Antigo bloqueio de race condition não é bloqueio vigente; navegação autenticada exige homologação própria |
| Descoberta30–32 | PR35/91e8e794377af4dd088e9d0a28ab80038b2329c4 | Não reimplementar busca/follows já existentes |
| Participação33 | PR38/98bdebbefd07fd4addcd9bb0e4bb80cfe36ed055 | Conceitos/UI sem entidade paralela |
| Acompanhamento34 | PR40/9eecea23743971cc423b3c1920e5d7da8751b3bb | Persistência implementada; produção não reinspecionada |
| Notificações de acontecimentos35 | PR43/2607113eb9d2461ee3723ec6ee202c8a94c9a405 | Watchers elegíveis e privacidade; não promete push/tempo real |
| História da Intent36 | PR44/917369ce29cb8142931093730f905a6294573443 | Eventos reais com projeção limitada; não inventar história antiga |
| Listas pessoais | PR45/0098179c35c027dda4a58b1520a550fa26f9efa5 | Seleção privada de guardiões, não destinatários independentes |
| Criador guardião | PR46/7b05285ed8e25a44a19f54f22ce541306d2f7a03 | Inclusão explícita; proibição de autoapoio preservada |
| Sincronização de detalhe | PR47/bc095b4f3612351237c4e3e1bcac4c463f71b947 | viewerWatching em ambos os ramos, reconciliação; novo defeito exige nova reprodução |
| Métricas/conquistas37A | PR48/ad4482607c994653a8572cc6f4139d855ab55694 | Métricas objetivas; Bloco37 ampliado não é todo concluído |
| DRAFT/publicação26 | PR49/df02be79afaefd300e4106ecec0be0313ddb39f0 | Opcional, padrãoPUBLISHED;13 migrations versionadas na base; aplicação na VM não confirmada nesta tarefa |

Referências de PR: https://github.com/edinhogrubert/Intent/pulls. Histórico detalhado e origem dos antigos relatórios em [Histórico](07_HISTORICO.md). Resultados anteriores de testes estão em [Testes](06_TESTES.md), identificados como relatos/documentação, sem certificação do estado atual.

## Consolidações encerradas

- **Documentos — PR50:** merge `c78bd68bcb9a09a836f2051014c9671c9eeb766c`; substituiu84 caminhos Markdown antigos, com conteúdo útil consolidado e mapa de origem em Histórico. Preservada a identidade permanente da seção2.13. Agents.md na raiz e dez documentos por assunto.
- **Scripts — PR51:** merge `4a140976c4d88424c31787183c389a1a0f969702`;40 SH e6 auxiliares pessoais retirados de Nova pasta, com links imutáveis/hashes no catálogo. Entrada única `script/intent.sh`, módulos compartilhados, instalação por pacote completo e manual.16 SH ativos, incluindo quatro wrappers transitórios de checkout e entrypoint backend preservado.
- **Evidências:**17 testes isolados e sintaxe global aprovados na árvore da implementação; CI do PR51 e CI pós-merge aprovados. Scripts usam mocks/temporários nas validações locais; isso não certifica recuperação real ou operação da VM. Não repetir suítes de aplicação por este fechamento exclusivamente documental.

Não existe integração pendente dessas duas entregas. Não há tag/release de aplicação nova. PC/VM instalados, deploy, migrações, backup real e restauração não foram executados nestas consolidações.

## Próxima ação e manutenção do estado

Para desenvolvimento, consultar main/PR atuais e o escopo residual em Novas funcionalidades antes de escolher bloco; não reimplementar entregas da tabela acima. Se houver operação autorizada de instalação PC/VM, seguir `script/instalar.sh` e o [manual](../script/MANUAL.md); o bootstrap antigo foi removido. Instalação local e instalação VM são operações distintas, sem sincronização presumida.

Documentação de governança deve ser fechada na mesma entrega: atualizar estado após merge/CI, remover próximos passos já concluídos e reconciliar referências substituídas antes de comunicar conclusão. Evidência histórica permanece identificada como histórica. Registrar lacunas reais de PC/VM separadamente; não criar pendências artificiais de organização nem novos arquivos de handoff.

## Fechamento administrativo de PRs antigas — 17/10/2026

CONFIRMADO pela API GitHub: PR [#15](https://github.com/edinhogrubert/Intent/pull/15) encerrada sem merge, pois seu verificador independente foi substituído pela consolidação operacional PR51. PR [#28](https://github.com/edinhogrubert/Intent/pull/28) encerrada sem merge do código antigo. Sobre a #28, o proprietário RELATOU que a criação de dados fictícios para povoamento de Intents já foi executada com sucesso e encontra-se funcionando; o banco, a origem exata dos dados e a VM não foram inspecionados nesta atividade. Não repetir seed, excluir dados nem reinterpretar os acontecimentos fictícios como históricos reais. Nenhuma operação de PC/VM, deploy, migração ou teste de aplicação foi executada por este fechamento.

CI CONFIRMADO para a revisão `309b0120df14dff5697ddfd37fc8bc9d51e2eec8`: [execução 38679477291](https://github.com/edinhogrubert/Intent/actions/runs/38679477291) com conclusão `success`. A próxima etapa é diagnóstico do PC (checkout, alterações locais e pacote operacional) antes de qualquer instalação. A revisão HEAD deve ser novamente conferida depois destas atualizações documentais.


## Especificação de reconstrução

Em 18/10/2026 UTC foi inventariada estaticamente a main `0689c33781976f16fa3e55f87edfbcca91f9fa8e`, incluindo árvore frontend/API, schema e 12 migrations Prisma, rotas, serviços, testes unitários/PostgreSQL e CI. Criado o documento `10_ESPECIFICACAO_RECONSTRUCAO.md` com capacidades confirmadas, matriz de aceitação, roteiro de implementação e lacunas explícitas. Este inventário não executou suítes nem verificou PC, VM ou deploy. Consulte a conclusão/CI no histórico antes de repetir testes.
