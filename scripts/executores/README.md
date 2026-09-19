# Executores Operacionais do Intent

Esta pasta contém os scripts de referência e instalação dos executores operacionais do projeto Intent.

O objetivo é impedir comandos soltos no fluxo diário. O usuário não deve chamar scripts auxiliares diretamente. O usuário chama apenas uma função numerada do executor adequado:

- PC: `/home/grubert/intent-automacao/intent-executor-PC.sh <função>`
- VM: `/home/ubuntu/intent-executor-VM.sh <função>`

## Bootstrap único

Para evitar vários comandos soltos, existe um bootstrap único para baixar na pasta `Downloads` e executar manualmente:

```text
scripts/executores/baixar-e-atualizar-executores.sh
```

Esse bootstrap:

1. valida que está rodando no PC esperado;
2. busca os instaladores no GitHub;
3. instala/atualiza o executor do PC;
4. exige acesso à VM por SSH: se a conexão falhar, encerra com erro após a etapa do PC, sem concluir a atualização da VM;
5. com SSH funcional, instala/atualiza o executor da VM;
6. lista as funções instaladas;
7. grava relatório em `~/Downloads/intent-relatorios/`.

**Atenção:** o bootstrap altera executores instalados no PC e na VM; não executá-lo para testar a reorganização documental. A referência selecionada é a primeira acessível entre `INTENT_EXECUTOR_REF` (quando definida), `main` e a branch histórica `docs/contratos-agentes`. Confirmar a referência efetiva antes de qualquer instalação autorizada. Uma falha após a instalação no PC pode deixar os ambientes em versões diferentes.

## Interface única

PC e VM usam a mesma numeração. Quando uma função não se aplica ao ambiente, o executor deve responder `N/A` sem reaproveitar o número para outra finalidade.

| Função | Intenção fixa |
|---:|---|
| 1 | Validar ambiente |
| 2 | Inspecionar repositório Git |
| 3 | Verificar release/tag atual |
| 4 | Verificar recursos do ambiente |
| 5 | Validar backup existente |
| 6 | Criar e validar backup |
| 7 | Sincronizar código com origem oficial |
| 8 | Rodar validações/testes do ambiente |
| 9 | Atualizar/validar continuidade |
| 10 | Preparar release |
| 11 | Criar/validar tag ou release |
| 12 | Deploy controlado |
| 13 | Validar aplicação em execução |
| 14 | Relatório final de fechamento |
| 15 | Rollback controlado |

## Scripts auxiliares que não devem ser chamados diretamente

Estes scripts podem existir no PC ou na VM, mas devem ser chamados apenas por uma função numerada quando integrados ao executor. O backup Git do PC é criado internamente pela função 6; o script legado de backup não é chamado por ela.

| Script auxiliar | Ambiente | Função que chama |
|---|---|---:|
| `/home/grubert/intent-automacao/intent-backup-git-PC.sh` | PC | Nenhuma; legado, não chamado pela função 6 |
| `/home/grubert/intent-automacao/intent-retomada-PC.sh` | PC | 14 |
| `/opt/intent/scripts/executar-backup-postgres.sh` | VM | 6 e 12 |
| `/opt/intent/source/deploy/oracle/08-deploy-backend.sh` | VM | 12 |
| `/home/ubuntu/intent-retomada-VM.sh` | VM | 14 |
| `deploy/oracle/21-verificar-intent-completo.sh`, se existir | VM | 13 |

## Instalação por download e execução

O método operacional é baixar o instalador do GitHub e executá-lo no ambiente correto. O instalador valida usuário, host, arquivos existentes, cria cópia de segurança e só então instala/substitui o executor.

Arquivos de instalação:

- `scripts/executores/baixar-e-atualizar-executores.sh`
- `scripts/executores/instalar-executor-PC.sh`
- `scripts/executores/instalar-executor-VM.sh`

## Regra para agentes

Agentes não devem instruir o usuário a executar `git`, `npm`, `ssh`, `docker`, `pg_dump`, `pg_restore` ou scripts auxiliares diretamente quando uma função numerada cobre a operação.

A notação humana `função PC(...)` ou `função VM(...)` descreve uma solicitação, **não é comando de terminal**. Quando houver autorização para executar, informar o comando com caminho absoluto, conforme `gestao/governanca/contratos/INTERFACE_EXECUTORES.md`, por exemplo:

```bash
bash /home/grubert/intent-automacao/intent-executor-PC.sh 1
```

ou, no terminal da VM:

```bash
bash /home/ubuntu/intent-executor-VM.sh 1
```

Esses exemplos são apenas ilustrativos: não executá-los como parte da reorganização. O usuário executa somente a operação autorizada, cola o relatório, e o próximo passo é decidido a partir do resultado.
