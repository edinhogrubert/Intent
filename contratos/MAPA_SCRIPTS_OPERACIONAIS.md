# Mapa de Scripts Operacionais

Este contrato registra quais scripts podem existir no PC e na VM e por qual função numerada eles devem ser chamados.

A regra é simples: scripts auxiliares podem existir, mas não devem virar comandos soltos no fluxo humano. Se existir um script auxiliar, ele precisa estar atrás de uma função numerada do executor.

## Regra de interface

- O usuário chama apenas executor com caminho absoluto.
- O ChatGPT não deve mandar o usuário chamar scripts auxiliares diretamente.
- O número da função tem o mesmo significado no PC e na VM.
- Se não servir para um ambiente, o executor deve retornar N/A.
- Scripts auxiliares continuam podendo existir, mas ficam como implementação interna.

## PC

| Script | Estado | Função responsável | Observação |
|---|---|---:|---|
| `/home/grubert/intent-automacao/intent-executor-PC.sh` | executor oficial | entrada única | Deve receber números de função. |
| `/home/grubert/intent-automacao/intent-backup-git-PC.sh` | auxiliar legado | nenhuma no executor novo | Não chamar direto. Foi identificado como preso ao `mvp-1.0.23`; a função PC 6 passou a criar o bundle internamente. |
| `/home/grubert/intent-automacao/intent-retomada-PC.sh` | auxiliar | 14 | Não chamar direto; relatório/retomada deve passar pela função 14. |
| `/home/grubert/intent-automacao/intent-atualizar-controle-release-PC.sh`, se existir | auxiliar legado | 10 ou 11 | Deve ser absorvido por preparar release ou criar/validar release. |
| scripts avulsos de correção de continuidade, se existirem | auxiliares legados | 9 | Devem ser absorvidos por validar/atualizar continuidade. |

## VM

| Script | Estado | Função responsável | Observação |
|---|---|---:|---|
| `/home/ubuntu/intent-executor-VM.sh` | executor oficial | entrada única | Deve receber números de função. |
| `/opt/intent/scripts/executar-backup-postgres.sh` | auxiliar | 6 e 12 | Não chamar direto; backup PostgreSQL deve passar pela função 6 ou pelo deploy controlado. |
| `/opt/intent/source/deploy/oracle/08-deploy-backend.sh` | auxiliar | 12 | Não chamar direto; deploy deve passar pela função 12. |
| `/opt/intent/source/deploy/oracle/21-verificar-intent-completo.sh`, se existir | auxiliar | 13 | Não chamar direto; validação operacional deve passar pela função 13. |
| `/home/ubuntu/intent-retomada-VM.sh` | auxiliar | 14 | Não chamar direto; relatório/retomada deve passar pela função 14. |

## Funções oficiais

| Função | Intenção fixa | PC | VM |
|---:|---|---|---|
| 1 | Validar ambiente | aplica | aplica |
| 2 | Inspecionar repositório Git | aplica | aplica |
| 3 | Verificar release/tag atual | aplica | aplica |
| 4 | Verificar recursos do ambiente | aplica | aplica |
| 5 | Validar backup existente | Git bundle | PostgreSQL dump |
| 6 | Criar e validar backup | cria bundle Git internamente | chama backup PostgreSQL |
| 7 | Sincronizar código com origem oficial | sincroniza main local | sincroniza/fetch na VM |
| 8 | Rodar validações/testes do ambiente | lint/build/testes | containers/endpoints/smoke |
| 9 | Atualizar/validar continuidade | valida contratos/estado | valida presença implantada |
| 10 | Preparar release | aplica | N/A |
| 11 | Criar/validar tag ou release | cria tag com autorização | valida existência da tag |
| 12 | Deploy controlado | N/A | chama deploy backend |
| 13 | Validar aplicação em execução | N/A | chama verificador ou smoke |
| 14 | Relatório final de fechamento | chama retomada PC se existir | chama retomada VM se existir |
| 15 | Rollback controlado | N/A | reservado; não automatizado sem procedimento validado |

## Revisão de scripts soltos

Scripts identificados no histórico:

- `intent-backup-git-PC.sh`: legado; não deve ser chamado diretamente nem pela função PC 6 nova, pois foi identificado como fixo em `mvp-1.0.23`.
- `intent-retomada-PC.sh`: deve ficar atrás da função PC 14.
- `intent-atualizar-controle-release-PC.sh`: deve ser absorvido pelas funções PC 10/11.
- `intent-corrigir-continuidade-PC.sh`: deve ser absorvido pela função PC 9.
- `intent-instalar-backup-postgres-VM.sh`: foi instalador/ajuste histórico; a operação final deve aparecer como função VM 5/6.
- `executar-backup-postgres.sh`: deve ficar atrás da função VM 6 e ser chamado pelo deploy controlado na VM 12.
- `08-deploy-backend.sh`: deve ficar atrás da função VM 12.
- `21-verificar-intent-completo.sh`, se estiver no repositório/VM: deve ficar atrás da função VM 13.

## Regra para novos scripts

Quando qualquer agente criar um novo script operacional, deve também atualizar este mapa e informar:

- caminho do script;
- se é executor oficial ou auxiliar;
- qual função numerada chama o script;
- se altera PC, VM ou ambos;
- se é seguro chamar pelo usuário ou apenas pelo executor.

Sem esse registro, o script é considerado solto e não deve entrar no fluxo operacional.
