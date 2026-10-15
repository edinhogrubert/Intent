# Intent — estado verificado e continuidade

## Referência desta atualização

Data:14/10/2026, America/Sao_Paulo. **Base de produto inspecionada:** main em `df02be79afaefd300e4106ecec0be0313ddb39f0`, merge da PR49, head de implementação `aa658616acaa19f622186bc2b0fbafcb6c5da5ef`, branch `feat/intent-draft-publish`.

Este SHA identifica a base de aplicação que fundamenta os documentos; não é afirmação de que main nunca avançará. A consolidação documental acrescenta commit posterior, consultável no Git/PR desta alteração. Antes de nova ação, consultar referências remotas e diferenças locais; não executar instrução antiga só porque este snapshot a menciona.

## Matriz de confirmação

| Superfície | Evidência / estado |
|---|---|
| GitHub oficial | Main e árvore completa consultadas;84 Markdown originais,74 conteúdos distintos. Código lido e histórico Git disponível |
| Checkout desta consolidação | Clone isolado da base oficial, branch docs/consolidar-documentos; não é PC do proprietário |
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

## Trabalho desta consolidação

Escopo autorizado: onze documentos canônicos (Agents.md+dez em documentos/); remoção dos84 Markdown anteriores inclusive cópias/histórico; adaptação de caminhos documentais usados pelos dois executores, correção do retorno do resumo PC detectada em teste e referência textual do componente de diagnóstico; remoção do patch documental de DRAFT já aplicado. Sem alteração de domínio/API/Prisma/migrations/Firebase/Docker/release e sem acesso à VM.

Não copiar para cá o antigo “PR26 bloqueado”, nem a restrição histórica que proibia começar26 antes de autorização passada. Não declarar deploy, tag ou bug atual com base nesses textos. As pendências futuras devem estar somente em Novas funcionalidades; lacunas de evidência operacional ficam nesta matriz.

## Próximo passo e atualização

Após publicação, conferir main remota e o diff integrado. Se o proprietário quiser usar função9 dos executores nos seus ambientes, instalar a referência atualizada pelo bootstrap existente, em ação operacional própria; esta tarefa não afirma que a cópia externa ao Git já mudou. Não é necessário reconstruir aplicação por causa de Markdown.

Em próximo bloco: consultar main/PR atuais, selecionar somente escopo residual aprovado, indicar ator/revisão/ambiente e verificar origem publicada. Atualizar esta fotografia quando houver nova evidência material ou conclusão, sem gerar novo arquivo de retomada. Usar o formato de handoff em [Agents](../Agents.md). Pendência de homologação não exige refazer todas as suítes; executar a validação que falta.


## Bloco atual — consolidação de scripts (2026-10-15 UTC)

CONFIRMADO no checkout: base oficial `c78bd68bcb9a09a836f2051014c9671c9eeb766c`, branch `refactor/scripts-consolidados`. Pacote `script/` implementado, manual local e catálogo atualizado. Origens dos40 SH e6 auxiliares pessoais retirados de Nova pasta estão no catálogo com links imutáveis e hashes. Wrappers de checkout preservam duas entradas de executor e duas de deploy.

Validação local: `bash script/testes/validar.sh`, sintaxe global e17 testes isolados aprovados; incluem falhas de fetch/saúde/catálogo, dump novo, espaços em caminhos, documentos, PC8 descartável, instalação/ativação e tratamento de saída explícita dos componentes. Trata-se de mocks/temporários, não de comprovação de operação em produção. CI e commit publicado devem ser consultados no PR da branch; não inferir aprovação por este registro.

PC/VM instalados, deploy, migrações, backup real e restauração: não executados nesta entrega. Próximo passo após revisão/CI: integrar a branch pelo PR; instalar ferramentas em cada ambiente somente em operação própria autorizada. Nenhuma nova versão/tag de aplicação criada.
