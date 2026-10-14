# Intent — scripts, executores e recuperação

Referência única da interface operacional. Código versionado não prova instalação no PC/VM. Não executar bootstrap, deploy, backup ou restauração apenas por ler este documento. Autorização e handoff em [Agents](../Agents.md); ambientes em [Arquitetura](03_ARQUITETURA.md).

## 1. Entradas humanas e interface

PC: `/home/grubert/intent-automacao/intent-executor-PC.sh`. VM: `/home/ubuntu/intent-executor-VM.sh`. Nas referências atuais, PC usa grubert/lubuntu e VM usa ubuntu/intent-app-01; outro ambiente exige adaptação versionada. O número representa intenção fixa. Nova função exige descrição em PC/VM, efeitos, N/A, instalação controlada e validação.

Exemplos de inspeção documental, somente no ambiente correto e com executor instalado:

```bash
bash /home/grubert/intent-automacao/intent-executor-PC.sh 9
bash /home/ubuntu/intent-executor-VM.sh 9
```

A segunda linha é para terminal já dentro da VM. A partir do PC, usar SSH com destino/chave confirmados; referência histórica:

```bash
ssh -i /home/grubert/.ssh/id_ed25519 -o ServerAliveInterval=60 -o ServerAliveCountMax=3 ubuntu@157.151.255.227 'bash /home/ubuntu/intent-executor-VM.sh 9'
```

IP e chave não foram testados nesta consolidação. Não entregar somente “execute PC(9)” ou número sem ambiente e caminho.

| Nº | Intenção | PC versionado | VM versionada | Efeito / limite |
|---:|---|---|---|---|
| 1 | Validar ambiente | Usuário, host, pastas e comandos | Idem | Não adapta estação automaticamente |
| 2 | Inspecionar Git | Remoto, branch, HEAD e árvore limpa | Idem | Não prova commit da imagem em execução |
| 3 | Verificar tag/release | Fetch e lista tags | Tenta fetch e lista tags | Tag não prova release publicada ou implantação; VM tolera falha de fetch |
| 4 | Verificar recursos | Disco | Disco e memória | Fotografia de recursos |
| 5 | Validar backup existente | Bundle verify e checksum se existir | Dump/checksum e catálogo quando disponível | Não prova restauração ensaiada; ver limites abaixo |
| 6 | Criar e validar backup | Bundle --all interno, checksum e metadados | Chama rotina externa com sudo | Altera arquivos; não é operação somente leitura |
| 7 | Sincronizar código | Fetch, checkout main, pull --ff-only | Fetch --no-tags --prune e pull da branch atual; detached só faz fetch | Altera checkout/referências; VM não troca arbitrariamente a branch |
| 8 | Validar ambiente | Diff-check, lint/build frontend, test/build backend | Docker ps e consultas health/ready | VM8 pode imprimir saúde indisponível e retornar OK; não confundir com prova estrita |
| 9 | Conferir estrutura documental | Presença dos onze arquivos canônicos | Idem | Não valida atualidade nem fatos; não escreve Status |
| 10 | Preparar release | Encadeia 2/3/5/9 | N/A | Não cria release automaticamente |
| 11 | Criar/validar tag | Exige INTENT_RELEASE_TAG e INTENT_AUTORIZO_RELEASE=SIM; tag anotada e push | Exige INTENT_RELEASE_TAG e verifica existência | Não cria release via API; autorização aplicável exigida |
| 12 | Deploy controlado | N/A | Exige INTENT_DEPLOY_COMPONENT=api/frontend/all, Git limpo, HEAD=origin/main e backup | Executa scripts dos componentes escolhidos; autorização de produção separada |
| 13 | Validar aplicação | N/A | Verificador externo se existir; senão Docker e health/ready/healthz estritos | Diferente de VM8; não substitui homologação completa |
| 14 | Relatório final | HEAD/status e retomada externa se existir | HEAD/status/containers e retomada se existir | Auxiliar opcional; relatório não certifica tudo sozinho |
| 15 | Rollback controlado | N/A | N/A/reservado; não automatizado | Não apresentar como se recuperasse banco/imagens |

Executores criam diretório de relatórios e lock na inicialização, inclusive para listagem. Relatório deve informar ambiente, funções, resultado individual, erros, pendências e alterações reais. O retorno explícito do resumo PC foi corrigido nesta consolidação; o dispatcher continua retornando o rc real da operação, inclusive falhas.

## 2. Referências, instalação e auxiliares

| Caminho / tipo | Função e pré-condições | Efeitos |
|---|---|---|
| [intent-executor-PC.sh](../scripts/executores/intent-executor-PC.sh) | Entrada PC: 1–15/list; caminhos fixos | Conforme tabela; função6 ignora backup legado |
| [intent-executor-VM.sh](../scripts/executores/intent-executor-VM.sh) | Entrada VM: 1–15/list | Conforme tabela; componentes de deploy explícitos |
| [baixar-e-atualizar-executores.sh](../scripts/executores/baixar-e-atualizar-executores.sh) | Bootstrap no PC grubert/lubuntu; Downloads, chave SSH e comandos exigidos; INTENT_EXECUTOR_REF escolhe ref | Instala PC e tenta VM por SSH; lista funções, hashes e log em ~/Downloads/intent-relatorios; altera também a VM |
| [instalar-executor-PC.sh](../scripts/executores/instalar-executor-PC.sh) | PC esperado; INTENT_EXECUTOR_REF ou INTENT_EXECUTOR_PC_URL | Lock, download, bash -n, cópia .bak e substituição; list |
| [instalar-executor-VM.sh](../scripts/executores/instalar-executor-VM.sh) | VM esperada; INTENT_EXECUTOR_REF ou INTENT_EXECUTOR_VM_URL | Idem; executor instalado é externo ao checkout |
| [08-deploy-backend.sh](../deploy/oracle/08-deploy-backend.sh) | Auxiliar VM12; root, credenciais, banco, rede e backup | Build, manutenção da API, backup, migrations no entrypoint, saúde e tentativa de rollback |
| [09-deploy-frontend.sh](../deploy/oracle/09-deploy-frontend.sh) | Auxiliar VM12; root, checkout limpo, Docker e Compose | Preserva imagem anterior, reconstrói/recria frontend, healthz e tentativa de rollback |
| /opt/intent/scripts/executar-backup-postgres.sh | Externo VM6/12, não versionado aqui | Dump; confirmar implementação, cron, fuso, retenção e permissões |
| /home/grubert/intent-automacao/intent-retomada-PC.sh | Externo opcional PC14 | Relatório; instalação/conteúdo não verificados |
| /home/ubuntu/intent-retomada-VM.sh | Externo opcional VM14 | Idem |
| /opt/intent/source/deploy/oracle/21-verificar-intent-completo.sh | Opcional VM13; não consta na árvore oficial inspecionada | Cópia em Nova pasta não prova instalação aprovada |
| /home/grubert/intent-automacao/intent-backup-git-PC.sh | Legado externo; sem uso pela PC6 atual | Relato anterior preso à tag1.0.23; não reativar |

Bootstrap é exceção de instalação; o fluxo normal volta ao executor. Preferir ref imutável aprovada em INTENT_EXECUTOR_REF para evitar baixar versões diferentes durante a operação. O bootstrap ainda possui fallback histórico para main/docs/contratos-agentes: conferir a ref impressa. Não afirmar que arquivos recém-versionados já foram instalados no PC/VM. Não copiar chaves, tokens, .env ou sessões de outra estação.

Script novo, se necessário: registrar finalidade, caminho, função/ambiente, entradas, pré-condições, efeitos, falhas, idempotência e validação. Não criar auxiliar avulso quando função existente atende. Comandos internos de investigação do agente não precisam virar novo instalador humano.

## 3. Deploy aprovado e limites da prova

Antes: confirmar revisão aprovada, árvore limpa, remoto oficial, backup e conjunto recuperável, compatibilidade de schema, imagens anteriores, recursos, rede e credenciais. Não usar reset/clean para esconder alterações; preservar commits exclusivos. Deploy key da VM deve ser somente leitura. Registrar imagens/digests API/frontend, backup, migrations e horários; HEAD alinhado não prova container reconstruído.

VM12 escolhe api/frontend/all e faz backup antes dos componentes. API preserva a chave existente; não gerar chave nova em restauração. Entrypoint usa migrate deploy; não usar migrate reset/dev ou db push em produção. Script09 preserva imagem do frontend e valida healthz. Não reiniciar PostgreSQL/Redis como efeito colateral de alteração de aplicação.

Checks da operação aprovada: containers healthy; API /health/live e /health/ready; frontend /healthz e proxy /api/health/ready; 401 sem token quando exigido; migrations sem falhas; bindings de 3000/8080 somente em loopback e dados sem publicação IPv4/IPv6; redes corretas. Validar login, apoio, guardião, realização e conteúdo antigo conforme a mudança. Túnel SSH não equivale a portas públicas abertas; não presumir domínio ou TLS.

Limites conhecidos, sem correção de escopo nesta consolidação:

- Traps ERR não cobrem toda saída exit1; primeira implantação não possui imagem anterior; rotina externa e escolha de dump por data exigem conferir janela e concorrência.
- VM5 verifica dump/checksum, mas seu fallback de pg_restore tolera falha; não prova catálogo ou restauração.
- VM8 tolera indisponibilidade de saúde; usar resultados específicos e VM13 para confirmação estrita.
- Função15 permanece não automatizada. Não apresentar rollback como garantia de recuperação.

## 4. Backup e restauração em manutenção autorizada

Política histórica: PostgreSQL local às03:15, retenção7dias, pasta /opt/intent/backups/postgres e log /opt/intent/logs/postgres-backup.log. Confirmar cron, fuso e execuções recentes. Houve relato de cópia externa local validada; isso não comprova rotina automática, ensaio nem disponibilidade atual fora da VM. Bundle Git não contém PostgreSQL, Firebase, chaves ou Redis. Dump no mesmo disco não protege contra perda da VM.

O conjunto recuperável inclui dump confiável/checksum, horário UTC, commit/schema/contagens, imagens ARM64 ou digests aprovados, chave original e configurações/credenciais protegidas, definições de usuário/banco/rede/volumes e identidades Firebase recuperáveis. Não versionar pacote sensível. pg_restore --list valida catálogo; a prova de recuperação é restauração ensaiada em instância isolada.

Backup manual, somente em exceção aprovada à função6: interromper escritores conforme janela, impedir deploy concorrente, usar umask077 e arquivo .partial novo fora do checkout; executar pg_dump custom sem owner/privileges com destino/usuário confirmados; validar tamanho e catálogo, renomear atomicamente, gerar/conferir SHA256 e registrar o conjunto. Não colocar senha na linha de comando. Se era só backup, retomar a mesma versão após validação. Revisar a rotina externa antes de inventar comando equivalente.

Restauração planejada:

1. Autorizar janela, destino e perda de escritas posteriores ao dump; fazer backup de segurança do estado atual e parar todos os escritores. Não selecionar automaticamente o dump mais recente.
2. Conferir checksum, origem, commit/schema, chave e versões compatíveis PostgreSQL. Preferir banco vazio isolado aprovado; --clean só remove objetos presentes no dump, não objetos futuros exclusivos do destino.
3. Provisionar usuário/banco e permissões; confirmar current_database/current_user. Restaurar transacionalmente com pg_restore --single-transaction, --no-owner e --no-privileges. Avaliar --clean/--if-exists apenas no destino de manutenção autorizado. Esta descrição não autoriza execução destrutiva.
4. Se falhar, manter API parada e investigar o código de saída. Não apagar _prisma_migrations ou resetar Prisma para esconder incompatibilidade.
5. Conferir migrations, contagens e integridade contra o registro do backup. Restaurar PostgreSQL não restaura Firebase nem Redis.
6. Selecionar código/imagens compatíveis com o schema. Rollback apenas de código, se compatibilidade comprovada, não exige apagar dados. A chave original precisa abrir conteúdo antigo.
7. Subir API/frontend pelo procedimento aprovado e validar saúde, rede, login Firebase/vínculo UID, conteúdo antigo e fluxos. Registrar commit, dump/checksum, imagens, perdas, operador, data e resultados antes de liberar acesso.

Não fixar recuperação em mvp-1.0.0 por ser exemplo antigo. A baseline histórica continua conhecida: commit62e78cc040afc08e13c44e2fd943134643e05231 e objeto de tagc1ba305d9c7bf8474f88defb3429f8aa1e756cb1. Escolher conjunto compatível com o ponto real de recuperação; não mover/recriar tag para forçar compatibilidade. Rebuild sem imagens preservadas pode produzir binário diferente se imagens base não forem fixadas. archive/intentV1 não é versão de rollback.

Não usar como limpeza de recuperação: docker compose down -v, docker volume prune, flush Redis, exclusão de imagens de rollback ou logs de auditoria. Não publicar dumps ou segredos. A função15 não implementada exige procedimento revisado em ação própria.

## 5. Reconstrução após perda da VM

Exige inventário protegido fora da VM: o repositório não contém manifestos completos de PostgreSQL/Redis, nomes de volumes ou topologia OCI. Sem dump sobrevivente, não prometer recuperação dos dados. Recriar VM ARM64 com região/capacidade aprovadas, timezone, swap, Docker/Compose, usuário/SSH restritos, UFW/NSG, saída Firebase e volumes corretos. Dados e portas3000/8080 sem ingresso público; domínio/TLS conforme plano aprovado.

Recriar diretórios, runtime, segredos e permissões de Arquitetura. Clonar oficial com Deploy Key RO em /opt/intent/source se destino ainda inexistente, sem sobrescrever checkout. Buscar revisão/tag aprovada e conferir SHA, origem e árvore. Preservar redes e serviços de dados sem portas; nome private não prova isolamento. Não atualizar versão principal do banco durante desastre por conveniência; evitar duas VMs gravando no mesmo ambiente.

Restaurar credencial Firebase autorizada do mesmo projeto, configuração, chave original e bancos; JSON web não substitui Admin. Recriar backup/cron com fuso e retenção confirmados. Restaurar dados antes da API, implantar conforme autorização e executar verificações da seção anterior. Conferir cópia fora do disco e ensaiar restauração após reconstruir. Restaurar banco não restaura contas Firebase excluídas.

## 6. Artefatos históricos não operacionais

Scripts em Nova pasta/, inventários .txt e md5sum são registros pessoais fora do fluxo normal. Não executar automaticamente consolidadores antigos da main, instaladores de backup ou receitas que citam Markdown removido. Para investigação histórica, consultar o commit original. Nenhum script histórico vira deploy aprovado por continuar no repositório. Código arquivado pode citar nomes antigos como registro, sem depender deles na aplicação vigente.

Inventário dos scripts históricos presentes na base; catálogo não é instrução de execução:

| Arquivo | Tratamento |
|---|---|
| `Nova pasta/20-ativar-feed-seguindo.sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/21-verificar-intent-completo.sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/21-verificar-intent-completo3.sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/22-verificar-feed-seguindo.sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/23-ativar-criacao-seguidores.sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/24-implantar-estabilizacao-intent.sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/24-implantar-estabilizacao-intentold.sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/27-preparar-pacote-consolidado.sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/27-preparar-pacote-consolidado1.sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/27-preparar-pacote-consolidadoOK.sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/30-etapa1-registrar-estado.sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/31-etapa2-backup-completo (1).sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/31-etapa2-backup-completo.sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/32-etapa3-alinhar-codigo-main.sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/32-etapa3-alinhar-codigo-main1.sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/32-etapa3-alinhar-codigo-main2 (1).sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/32-etapa3-alinhar-codigo-main2.sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/32-etapa3-alinhar-codigo-main3 (1).sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/32-etapa3-alinhar-codigo-main3.sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/33-etapa4-validar-main.sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/33-etapa4-validar-main1.sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/33-etapa4-validar-main2 (1).sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/33-etapa4-validar-main2.sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/33-etapa4-validar-main3 (1).sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/33-etapa4-validar-main3.sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/34-diagnosticar-bundle.sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/34-diagnosticar-bundle3.sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/35-etapa5-reimplantar-main.sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/36-etapa7-conferencia-final.sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/baixar-e-atualizar-executores.sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/intent-atualizar-controle-release-PC.sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/intent-corrigir-continuidade-PC.sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/intent-inspecionar-executor-VM-PC.sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/intent-instalar-backup-postgres-VM (1).sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/intent-instalar-backup-postgres-VM (2).sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/intent-instalar-backup-postgres-VM.sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/intent-instalar-backup-postgres-VMold.sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/intent-instalar-backup-postgres-VMold2.sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/intent-instalar-funcao6-PC.sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |
| `Nova pasta/intent-instalar-retomada-PC.sh` | Histórico pessoal; não integrar ao fluxo ativo sem nova auditoria e registro de função. |


Auxiliares externos citados anteriormente, sem instalação confirmada: intent-atualizar-controle-release-PC.sh (intenções10/11), intent-corrigir-continuidade-PC.sh (9) e intent-instalar-backup-postgres-VM.sh (instalador histórico/VM5–6). Não multiplicar instaladores para contornar documentação.

Roteiros completos da baseline anterior são recuperáveis nos links imutáveis de [Histórico](07_HISTORICO.md). Não executar exemplos antigos de função/commit/dump sem reconciliá-los com a operação aprovada.
