# Scripts e recuperação Intent

Catálogo técnico. O [manual de uso](../script/MANUAL.md) contém instalação, comandos, parâmetros, efeitos e tratamento de falhas. `script/` substitui `Nova pasta/` por consolidação; arquivos históricos continuam recuperáveis no Git, sem receitas obsoletas executáveis na árvore ativa.

A função PC9 verifica a presença de `Agents.md`, dos documentos canônicos `00`–`10` em `documentos/` e deste manual. Ela não verifica conteúdo, atualidade ou autoridade das fontes.

| Caminho | Responsabilidade |
|---|---|
|[intent.sh](../script/intent.sh)|Entrada única pc/vm, números1–15, list/--plan, identidade, lock e relatórios|
|[instalar.sh](../script/instalar.sh)|Pacote completo extraído de commit aprovado, validação e ativação atômica local|
|[comum.sh](../script/lib/comum.sh)|Resultados, ambiente e aprovação de revisão|
|[git.sh](../script/lib/git.sh)|Inspeção Git, consulta de tags e presença documental compartilhadas|
|[backup.sh](../script/lib/backup.sh)|Seleção segura com espaços, checksums, catálogo e identificação de dump novo|
|[docker.sh](../script/lib/docker.sh)|Consultas de saúde com timeout e falha propagada|
|[pc.sh](../script/acoes/pc.sh)|Ações exclusivas PC, bundle, validações em clone descartável e tags|
|[vm.sh](../script/acoes/vm.sh)|Ações exclusivas VM, backups externos e orquestração de deploy|
|[deploy-api.sh](../script/acoes/deploy-api.sh)|Implementação backend centralizada, revisão aprovada e lock|
|[deploy-frontend.sh](../script/acoes/deploy-frontend.sh)|Implementação frontend centralizada, revisão aprovada e lock|
|[validar.sh](../script/testes/validar.sh)|Sintaxe global e contratos isolados sem produção|
|[docker-entrypoint.sh](../backend/docker-entrypoint.sh)|POSIX junto ao Dockerfile; migrate deploy e início da API; não mover para biblioteca Bash|

Os antigos caminhos de executores PC/VM e deploy08/09 são wrappers transitórios de checkout, sem duplicação de lógica. Instaladores antigos foram removidos; usar instalar.sh. Nenhuma cópia externa instalada foi modificada. Não fazer download de apenas um wrapper/entrypoint. O instalador não acessa VM remotamente; PC e VM têm instalações e evidências distintas.

O ambiente oficial continua PC grubert/lubuntu e VM ubuntu/intent-app-01. Endereços SSH históricos não são prova de acesso vigente. Configurações, IDs, pré-condições e efeitos estão no manual; números não foram renumerados. Função15 permanece N/A. Nenhuma rotina passa a ser homologada por sua mera inclusão no pacote.

## 3. Deploy aprovado e limites da prova

Antes: confirmar revisão aprovada, árvore limpa, remoto oficial, backup e conjunto recuperável, compatibilidade de schema, imagens anteriores, recursos, rede e credenciais. Não usar reset/clean para esconder alterações; preservar commits exclusivos. Deploy key da VM deve ser somente leitura. Registrar imagens/digests API/frontend, backup, migrations e horários; HEAD alinhado não prova container reconstruído.

VM12 escolhe api/frontend/all. API exige a chave original previamente provisionada e valida um dump novo dentro da janela; frontend não modifica banco. Entrypoint usa migrate deploy; não usar migrate reset/dev ou db push em produção. Script09 preserva imagem do frontend e valida healthz. Não reiniciar PostgreSQL/Redis como efeito colateral de alteração de aplicação.

Checks da operação aprovada: containers healthy; API /health/live e /health/ready; frontend /healthz e proxy /api/health/ready; 401 sem token quando exigido; migrations sem falhas; bindings de 3000/8080 somente em loopback e dados sem publicação IPv4/IPv6; redes corretas. Validar login, apoio, guardião, realização e conteúdo antigo conforme a mudança. Túnel SSH não equivale a portas públicas abertas; não presumir domínio ou TLS.

Limites conhecidos, sem correção de escopo nesta consolidação:

- Primeira implantação não possui imagem anterior; rotina externa e escolha de dump por data exigem conferir janela e concorrência.
- VM5 exige checksum e catálogo, mas não ensaia restauração.
- VM8/13 falham quando um endpoint consultado está indisponível; não substituem homologação.
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


## 6. Rastreabilidade da consolidação

Base inspecionada: `c78bd68bcb9a09a836f2051014c9671c9eeb766c`. Os48 SH originais foram revisados:40 em Nova pasta,5 em scripts/executores,2 deploy/oracle e1 backend. A tabela registra todos os46 itens de Nova pasta, inclusive6 auxiliares pessoais; SHA256 identifica conteúdo, e o link imutável permite recuperar o original sem manter duplicatas. Não se afirma que as receitas históricas tenham sido executadas ou instaladas.

| Origem imutável | SHA256 | Destino / decisão |
|---|---|---|
| [27-preparar-pacote-consolidadoOK.sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/27-preparar-pacote-consolidadoOK.sh) | `ecbff3c01fb8957a91f25ad26de6a3a5bab9e27e4806bc4e5793a832d56ee838` | Consolidação pontual retirada; não recriar cópia ampla de arquivos locais |
| [33-etapa4-validar-main3.sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/33-etapa4-validar-main3.sh) | `adae5934c64ebf074a11f9d24f5d3a616f1afb3c58d647097b049ae455b674b7` | PC8; validação em cópia descartável descrita no manual |
| [22-verificar-feed-seguindo.sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/22-verificar-feed-seguindo.sh) | `55a44b0eec5af6c6e0f9631de1b854cafbddde89ca16f0dc50cf136a4ac6531c` | VM8/13 e função14; sem relatórios de sucesso pré-fixados |
| [autorun.inf](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/autorun.inf) | `ae76a646db2bd2239f9928e6bc84fc5146700ea3b61abe0c50ab40b91fcbc475` | Metadado de mídia Rufus/Ubuntu; sem uso operacional Intent |
| [intent-instalar-retomada-PC.sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/intent-instalar-retomada-PC.sh) | `b64275fea2bef7d36c35dbaebaaeba771d488936ff69af6451ec505799e8be46` | VM8/13 e função14; sem relatórios de sucesso pré-fixados |
| [35-etapa5-reimplantar-main.sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/35-etapa5-reimplantar-main.sh) | `1d3c8073a4588d8208da483e56535a3d6ee15cb7a996f7ce638bb5820d7a3a79` | script/acoes/deploy.sh; receita de revisão fixa retirada |
| [24-implantar-estabilizacao-intentold.sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/24-implantar-estabilizacao-intentold.sh) | `15088afbd6f2b0001ed6fbb039a0e06e613b1db01f6fdc92dc4fddb255e0fbac` | script/acoes/deploy.sh; receita de revisão fixa retirada |
| [32-etapa3-alinhar-codigo-main2.sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/32-etapa3-alinhar-codigo-main2.sh) | `b2c7e2deecc94a3c1c1f850477b96590a681c47f39214ea230783bfa373f3ae8` | Funções 2/3/7/9/14; receita pontual retirada |
| [31-etapa2-backup-completo (1).sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/31-etapa2-backup-completo%20%281%29.sh) | `7f56dc1ff0793ef52f9e657f7504ba083c5ff22884a40ade83458eb00a7c33e0` | script/lib/backup.sh e funções5/6; backup completo não presumido |
| [21-verificar-intent-completo3.sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/21-verificar-intent-completo3.sh) | `b9be948d92276c1f10ec5df946dc6bc9702c4136f60c57667bc6c6a8e8655793` | VM8/13 e função14; sem relatórios de sucesso pré-fixados |
| [intent-instalar-funcao6-PC.sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/intent-instalar-funcao6-PC.sh) | `12a4fd361c08e9b4e70233be9490dd1a221e34ccb2fcf0667d9a345b0b75f439` | script/lib/backup.sh e funções5/6; backup completo não presumido |
| [34-diagnosticar-bundle.sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/34-diagnosticar-bundle.sh) | `f8caa86f7c904c3467e7b23df038fa2b697ca0a456a325623ea953f5460ebe60` | PC8; validação em cópia descartável descrita no manual |
| [27-preparar-pacote-consolidado1.sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/27-preparar-pacote-consolidado1.sh) | `ecbff3c01fb8957a91f25ad26de6a3a5bab9e27e4806bc4e5793a832d56ee838` | Consolidação pontual retirada; não recriar cópia ampla de arquivos locais |
| [24-implantar-estabilizacao-intent.sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/24-implantar-estabilizacao-intent.sh) | `3515b63a9a3e9da89a5193cf50500dbde40e8d3bf207b1e1801e28cb3e2f338e` | script/acoes/deploy.sh; receita de revisão fixa retirada |
| [32-etapa3-alinhar-codigo-main3 (1).sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/32-etapa3-alinhar-codigo-main3%20%281%29.sh) | `6891ea19801b204445d1f7d25b239144cf435722ec288b0ba4e6fc94c123a34d` | Funções 2/3/7/9/14; receita pontual retirada |
| [32-etapa3-alinhar-codigo-main.sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/32-etapa3-alinhar-codigo-main.sh) | `09d08e58aaa507f68e15676e45b827593fb46f9fabbee25277e347f243200184` | Funções 2/3/7/9/14; receita pontual retirada |
| [intent-inspecionar-executor-VM-PC.sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/intent-inspecionar-executor-VM-PC.sh) | `4e912e4f1e7f96f19974f33b8e1d36e1c586ba90c8d013685d11cb2593f72474` | VM8/13 e função14; sem relatórios de sucesso pré-fixados |
| [32-etapa3-alinhar-codigo-main1.sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/32-etapa3-alinhar-codigo-main1.sh) | `09d08e58aaa507f68e15676e45b827593fb46f9fabbee25277e347f243200184` | Funções 2/3/7/9/14; receita pontual retirada |
| [34-diagnosticar-bundle3.sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/34-diagnosticar-bundle3.sh) | `cebf752524ad3839926567ef80c905c85a69bfee8f173e7429778717854b0703` | PC8; validação em cópia descartável descrita no manual |
| [resultados_sync.txt](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/resultados_sync.txt) | `bd302cb1758f21e07b84ea1d65cd55729b4d1ab35e4843be2719ce852c47e867` | Log histórico de sincronização |
| [31-etapa2-backup-completo.sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/31-etapa2-backup-completo.sh) | `7f56dc1ff0793ef52f9e657f7504ba083c5ff22884a40ade83458eb00a7c33e0` | script/lib/backup.sh e funções5/6; backup completo não presumido |
| [revisao.txt](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/revisao.txt) | `4d2278dafc56e38394c1a7147110c2942f2265640488f11586bd3fe12f848c2e` | Log histórico de revisão/backup |
| [intent-instalar-backup-postgres-VM (1).sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/intent-instalar-backup-postgres-VM%20%281%29.sh) | `48961e24f501c9f0cdbf28efefad10d234d04948054e38fc0eae9a7f3e1b18df` | script/lib/backup.sh e funções5/6; backup completo não presumido |
| [27-preparar-pacote-consolidado.sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/27-preparar-pacote-consolidado.sh) | `ecbff3c01fb8957a91f25ad26de6a3a5bab9e27e4806bc4e5793a832d56ee838` | Consolidação pontual retirada; não recriar cópia ampla de arquivos locais |
| [33-etapa4-validar-main3 (1).sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/33-etapa4-validar-main3%20%281%29.sh) | `adae5934c64ebf074a11f9d24f5d3a616f1afb3c58d647097b049ae455b674b7` | PC8; validação em cópia descartável descrita no manual |
| [md5sum.txt](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/md5sum.txt) | `6c4fa091ea320c7c78bcbc928b9aba25dee15c931eb210a052065da94f9e7036` | Checksums históricos da mídia, não do pacote operacional |
| [intent-instalar-backup-postgres-VM.sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/intent-instalar-backup-postgres-VM.sh) | `87e7de98ff5055e979808a40737708f06e341962c60127dd41c52f31d26c878a` | script/lib/backup.sh e funções5/6; backup completo não presumido |
| [33-etapa4-validar-main2 (1).sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/33-etapa4-validar-main2%20%281%29.sh) | `9ae6d5ab07a0f2a574cb659c549755eed4127a443e2304e2971f8831e0624daf` | PC8; validação em cópia descartável descrita no manual |
| [30-etapa1-registrar-estado.sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/30-etapa1-registrar-estado.sh) | `35a5063f62d7b497880e8a018e80bc817654ba5a98dd8d74350d267eed5ab5dd` | VM8/13 e função14; sem relatórios de sucesso pré-fixados |
| [intent-instalar-backup-postgres-VM (2).sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/intent-instalar-backup-postgres-VM%20%282%29.sh) | `48961e24f501c9f0cdbf28efefad10d234d04948054e38fc0eae9a7f3e1b18df` | script/lib/backup.sh e funções5/6; backup completo não presumido |
| [23-ativar-criacao-seguidores.sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/23-ativar-criacao-seguidores.sh) | `01c729cc058de9dea067519adc01f81021860fa86a06bfd4de643fb05de4e17c` | script/acoes/deploy.sh; receita de revisão fixa retirada |
| [32-etapa3-alinhar-codigo-main2 (1).sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/32-etapa3-alinhar-codigo-main2%20%281%29.sh) | `b2c7e2deecc94a3c1c1f850477b96590a681c47f39214ea230783bfa373f3ae8` | Funções 2/3/7/9/14; receita pontual retirada |
| [36-etapa7-conferencia-final.sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/36-etapa7-conferencia-final.sh) | `9ff933840ed5d1104a9b1d90ab451f6f4f322d39817b9a5aa9c5108c091d6336` | VM8/13 e função14; sem relatórios de sucesso pré-fixados |
| [intent-corrigir-continuidade-PC.sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/intent-corrigir-continuidade-PC.sh) | `d034114797185e0e17be4e889780228d1100b1e4dc7bb7c05a445b495676f2f4` | Funções 2/3/7/9/14; receita pontual retirada |
| [estrutura_projeto.txt](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/estrutura_projeto.txt) | `88edf504b8fda42bf7a97943e856de901729c41ae8a61a4dc6f218e5c56d24da` | Inventário histórico de árvore |
| [intent-instalar-backup-postgres-VMold.sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/intent-instalar-backup-postgres-VMold.sh) | `2501f24781aab712e620519fcbfe92a3ea1eca70db3d34229f98b41afb243a80` | script/lib/backup.sh e funções5/6; backup completo não presumido |
| [33-etapa4-validar-main.sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/33-etapa4-validar-main.sh) | `fa791b44a594afdf08291da964c8b97a938d04d3cf01518b7f50efe0ffba0d1e` | PC8; validação em cópia descartável descrita no manual |
| [config.yaml](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/config.yaml) | `35ab08366830a5282b1a0aad692d31b072c48b5b6049df0719a31fcab1eb0efa` | Configuração pessoal de assistente; sem uso pelo runtime Intent |
| [intent-instalar-backup-postgres-VMold2.sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/intent-instalar-backup-postgres-VMold2.sh) | `48961e24f501c9f0cdbf28efefad10d234d04948054e38fc0eae9a7f3e1b18df` | script/lib/backup.sh e funções5/6; backup completo não presumido |
| [32-etapa3-alinhar-codigo-main3.sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/32-etapa3-alinhar-codigo-main3.sh) | `6891ea19801b204445d1f7d25b239144cf435722ec288b0ba4e6fc94c123a34d` | Funções 2/3/7/9/14; receita pontual retirada |
| [21-verificar-intent-completo.sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/21-verificar-intent-completo.sh) | `f298e2003bed5d6ef4c2b47f35a31ae3ceaffe3d5173205f0d2b222a6d04dc9d` | VM8/13 e função14; sem relatórios de sucesso pré-fixados |
| [33-etapa4-validar-main2.sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/33-etapa4-validar-main2.sh) | `9ae6d5ab07a0f2a574cb659c549755eed4127a443e2304e2971f8831e0624daf` | PC8; validação em cópia descartável descrita no manual |
| [intent-atualizar-controle-release-PC.sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/intent-atualizar-controle-release-PC.sh) | `222e73f24429909169ef70fcda4ab446199aac837929b785daa704c1ccbe9d82` | script/instalar.sh; sem patch de texto |
| [baixar-e-atualizar-executores.sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/baixar-e-atualizar-executores.sh) | `c6a10234bb8f629207e271952d9e24658432e0971717522e315b67168dd710e2` | script/instalar.sh; sem patch de texto |
| [33-etapa4-validar-main1.sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/33-etapa4-validar-main1.sh) | `fa791b44a594afdf08291da964c8b97a938d04d3cf01518b7f50efe0ffba0d1e` | PC8; validação em cópia descartável descrita no manual |
| [20-ativar-feed-seguindo.sh](https://github.com/edinhogrubert/Intent/blob/c78bd68bcb9a09a836f2051014c9671c9eeb766c/Nova%20pasta/20-ativar-feed-seguindo.sh) | `5e40094824f93bacc2380f1e70df1ae89425ef69eaf3c0a2b36b79284d832b54` | script/acoes/deploy.sh; receita de revisão fixa retirada |
