# Manual operacional Intent

A interface única é `intent.sh pc|vm função...`; bibliotecas ficam em `lib/` e ações em `acoes/`. Executar no ambiente indicado, nunca copiar apenas o arquivo de entrada. Instalação em PC não instala VM e não executa SSH.

## Antes de usar

Revisar autorização, remoto oficial, branch, commit e árvore limpa. PC esperado: grubert/lubuntu; VM: ubuntu/intent-app-01. Bash4+, Git, Python3, flock, GNU coreutils. PC8 exige Bun1.4, Node22 e npm. VM exige Docker/Compose, curl, pg_restore compatível com o dump e sudo não interativo para ações específicas. Chaves, arquivos .env e dumps não pertencem ao repositório/pacote.

```bash
# Dentro de checkout oficial, somente listagem e planejamento (sem criar logs/locks):
bash script/intent.sh pc list
bash script/intent.sh vm --plan 2 9 13
# Inspeção no PC correto:
bash /home/grubert/Projetos/Intent-local/script/intent.sh pc 2 9 14
# Inspeção na VM correta, terminal já conectado:
bash /opt/intent/source/script/intent.sh vm 2 9 13 14
```

Toda execução numerada valida usuário/host e cria lock e relatório privado em `$HOME/intent-automacao/relatorios/`; list e --plan não criam arquivos nem validam produção. Falha encerra a sequência com retorno não zero. Não chamar funções shell diretamente nem carregar o entrypoint como biblioteca.

## Instalar versão aprovada

Conferir SHA completo vigente e revisado; não copiar um SHA histórico deste manual. Checkout deve estar limpo e no SHA aprovado. Executar `bash script/instalar.sh pc SHA_COMPLETO` no PC ou `bash script/instalar.sh vm SHA_COMPLETO` na VM. O instalador extrai somente `script/` do commit, valida sintaxe/listagem/checksums, preserva versões anteriores e ativa o pacote por troca atômica do symlink `current`. Não usa download mutável nem modifica trechos de executor instalado. Pacote instalado: `bash "$HOME/intent-automacao/current/script/intent.sh" pc list` (trocar pc por vm na VM).

Os caminhos externos antigos não são sobrescritos automaticamente. Depois de validar a instalação local, alterar atalhos/rotinas humanas para o novo comando. Wrappers em `scripts/executores/` e `deploy/oracle/` atendem apenas checkouts completos durante a transição. Não distribuir wrappers avulsos. Para voltar à versão anterior do pacote, selecionar uma release preservada e trocar o symlink current com `ln -s` temporário e `mv -T`; isso altera ferramentas, **não** banco, aplicação ou imagens. Nenhuma instalação foi feita em PC/VM por esta alteração do repositório.

## Funções e efeitos

| Nº | Operação | Efeito |
|---:|---|---|
|1|Validar ambiente|Inspeção local|
|2|Git local: origem, branch, HEAD, alterações|Leitura; não consulta main remota|
|3|Consultar tags|Fetch altera referências Git; não certifica release publicada|
|4|Recursos|Leitura de disco/memória|
|5|Validar backup|PC bundle/checksum; VM checksum e catálogo pg_restore; não restaura|
|6|Criar backup|PC bundle --all; VM rotina externa, exige exatamente um dump novo válido|
|7|Sincronizar|Fetch/pull; altera checkout; VM detached faz somente fetch|
|8|Validação|PC clone descartável instala dependências e roda lint/build/test; VM saúde estrita|
|9|Documentos|Presença de `Agents.md`, dos documentos `00`–`10` em `documentos/` e deste manual; não atualiza conteúdo nem certifica vigência|
|10|Preparar release|PC2/3/5/9; VM N/A; não substitui CI|
|11|Tag|PC cria/push com autorização; VM confere commit da tag; não cria release via API|
|12|Deploy|VM somente, api/frontend/all; altera containers e pode migrar banco; PC N/A|
|13|Aplicação|VM Docker e quatro endpoints; não prova fluxos autenticados/portas; PC N/A|
|14|Relatório|HEAD/status/tag, containers na VM; não inventa estado histórico|
|15|Rollback|N/A, não automatizado; exige procedimento de recuperação revisado|

PC11 exige `INTENT_RELEASE_TAG`, `INTENT_AUTORIZO_RELEASE=SIM` e `INTENT_EXPECTED_COMMIT` completo. VM11 também exige tag e SHA esperado. VM12 exige `INTENT_AUTORIZO_DEPLOY=SIM`, `INTENT_EXPECTED_COMMIT` e `INTENT_DEPLOY_COMPONENT=api|frontend|all`; main consultada deve apontar para o SHA aprovado. Isso é proteção de comando, não concede autorização humana por si só. Deploy executa como root, possui lock próprio e valida revisão novamente. `all` pode concluir API e falhar no frontend: não é transação única.

## Configuração e backups

`INTENT_BASE` muda o diretório de ferramentas/relatórios; `INTENT_REPO` muda checkout para inspeção e testes, sem dispensar identidade do ambiente. VM5/6 aceitam `INTENT_POSTGRES_BACKUP_DIR` e `INTENT_POSTGRES_BACKUP_SCRIPT` (padrões `/opt/intent/backups/postgres` e `/opt/intent/scripts/executar-backup-postgres.sh`). A rotina externa ainda precisa ser auditada na VM; não faz parte deste pacote. Dump existente é selecionado por data apenas para inspeção5; criação6 compara inventário antes/depois. Checksum e catálogo não provam restauração nem cópia fora da VM. PC bundle só contém Git, não arquivos ignorados, banco, Firebase ou credenciais.

## Falhas e recuperação

Consultar retorno e relatório antes de repetir. Não declarar sucesso por última linha nem repetir backup/deploy sem entender estado parcial. Logs de comandos podem conter informação operacional; manter acesso privado e revisar antes de compartilhar. Não registrar senhas ou copiar .env. Falha de instalação antes da ativação conserva current anterior; release preparada pode permanecer para diagnóstico. Não há instalação distribuída atômica PC/VM.

Deploy backend mantém a estratégia anterior de backup na janela, imagem anterior e recuperação; agora saídas explícitas também entram no tratamento de erro. Continua exigindo validação operacional em janela autorizada: rotina externa, dump associado, preservação da chave original, concorrência de escritores, rede e recuperação não são certificados por testes simulados. Não usar rollback de imagem como prova de recuperação de dados. Procedimento de banco e reconstrução está no [catálogo](../documentos/9_scripts.md). Nunca usar reset Prisma, down -v, prune de volumes ou apagar evidências para esconder falha.

## Desenvolvimento e testes

`bash script/testes/validar.sh` valida sintaxe de todos os SH (entrypoint backend com sh), contratos e falhas em diretórios temporários com comandos simulados. Não chama Docker, SSH ou serviços reais. CI executa a mesma suíte. Módulos não devem executar operações ao serem carregados. PC8 cria cópia descartável e acessa rede de dependências; PostgreSQL real e homologação continuam checks separados. Reaproveitar resultados aplicáveis à mesma revisão e executar novamente apenas pelo delta ou check obrigatório.
