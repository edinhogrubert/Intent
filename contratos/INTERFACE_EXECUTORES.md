# Interface dos Executores — PC e VM

Este contrato define a numeração oficial das funções dos executores do projeto Intent.

A regra é simples: **a numeração é uma interface**.

Como em uma interface Java, o número da função representa uma intenção fixa. Cada ambiente implementa essa intenção conforme sua realidade.

## Executores oficiais

PC:

```bash
bash /home/grubert/intent-automacao/intent-executor-PC.sh <função>
```

VM, quando já estiver dentro da VM:

```bash
bash /home/ubuntu/intent-executor-VM.sh <função>
```

VM, quando o comando for executado a partir do PC por SSH:

```bash
ssh -i /home/grubert/.ssh/id_ed25519 -o ServerAliveInterval=60 -o ServerAliveCountMax=3 ubuntu@157.151.255.227 'bash /home/ubuntu/intent-executor-VM.sh <função>'
```

## Regra de caminho absoluto

O ChatGPT deve sempre indicar o caminho completo do executor.

É proibido orientar apenas:

```text
Execute função PC(...)
Execute função VM(...)
```

Essas formas podem aparecer como explicação humana, mas a instrução operacional final deve trazer o comando completo com o caminho absoluto.

Formato correto para PC:

```bash
bash /home/grubert/intent-automacao/intent-executor-PC.sh 1 2 3
```

Formato correto para VM via SSH a partir do PC:

```bash
ssh -i /home/grubert/.ssh/id_ed25519 -o ServerAliveInterval=60 -o ServerAliveCountMax=3 ubuntu@157.151.255.227 'bash /home/ubuntu/intent-executor-VM.sh 1 2 3'
```

Formato correto se o usuário já estiver dentro da VM:

```bash
bash /home/ubuntu/intent-executor-VM.sh 1 2 3
```

## Regra de interface

- A função `1` deve significar a mesma coisa no PC e na VM.
- A função `2` deve significar a mesma coisa no PC e na VM.
- A função `6` deve significar a mesma intenção nos dois ambientes: criar e validar backup.
- Se uma função não servir para um ambiente, esse ambiente deve retornar `N/A`, `IGNORADO` ou `NÃO APLICÁVEL`.
- É proibido reutilizar um número com outro significado.
- É proibido inventar número sem atualizar este contrato.

## Tabela oficial

| Função | Intenção fixa | Implementação no PC | Implementação na VM |
|---:|---|---|---|
| 1 | Validar ambiente | Validar usuário `grubert`, host `lubuntu`, pastas locais e pré-condições do PC | Validar usuário/host da VM, pastas oficiais e pré-condições da VM |
| 2 | Inspecionar repositório Git | Validar repositório local, branch, remoto, status e HEAD | Validar repositório da VM, branch/tag, remoto, status e HEAD implantado |
| 3 | Verificar release/tag atual | Conferir release/tag conhecida e próxima versão planejada | Conferir release/tag atualmente implantada ou preparada |
| 4 | Verificar recursos do ambiente | Conferir disco, espaço para build e backup Git | Conferir disco, memória, serviços base e capacidade operacional |
| 5 | Validar backup existente | Validar backup Git bundle existente | Validar backup PostgreSQL existente |
| 6 | Criar e validar backup | Criar e validar backup Git | Criar e validar backup PostgreSQL |
| 7 | Sincronizar código com origem oficial | Atualizar `main` local com `origin/main` e confirmar HEAD | Atualizar código da VM para branch/tag autorizada |
| 8 | Rodar validações/testes do ambiente | Rodar testes, lint, build e checks locais definidos | Rodar smoke tests, endpoints e validações operacionais da aplicação |
| 9 | Atualizar ou validar continuidade | Atualizar/validar arquivos de continuidade e contratos | Validar presença dos arquivos de continuidade no código implantado ou retornar N/A |
| 10 | Preparar release | Validar estado para release, changelog, versão e pré-condições | Retornar N/A, salvo se houver preparação específica na VM |
| 11 | Criar ou validar tag/release | Criar/validar tag ou release quando autorizado | Validar que a tag/release autorizada existe e é a esperada |
| 12 | Deploy controlado | Retornar N/A | Exigir `INTENT_DEPLOY_COMPONENT=api`, `frontend` ou `all`; validar Git e backup antes de implantar somente os componentes escolhidos |
| 13 | Validar aplicação em execução | Validar ambiente local, se existir | Validar produção/VM após deploy |
| 14 | Gerar relatório final de fechamento | Relatório PC/Git/release/pendências | Relatório VM/deploy/produção/pendências |
| 15 | Rollback controlado | Retornar N/A | Executar rollback controlado quando autorizado |

## Regras para adicionar função nova

Uma função nova só pode ser criada se:

1. estiver documentada neste arquivo;
2. tiver uma intenção fixa;
3. tiver comportamento definido para PC e VM;
4. disser claramente quando um ambiente deve retornar N/A;
5. for instalada nos executores por script controlado;
6. for validada com `list` ou relatório equivalente.

## Regra para o ChatGPT

O ChatGPT nunca deve dizer:

```text
Execute função 8
```

sem indicar ambiente.

Também não deve deixar a instrução final apenas como:

```text
Execute função PC(8)
```

O formato operacional correto deve conter caminho absoluto:

```bash
bash /home/grubert/intent-automacao/intent-executor-PC.sh 8
```

ou, para VM via PC:

```bash
ssh -i /home/grubert/.ssh/id_ed25519 -o ServerAliveInterval=60 -o ServerAliveCountMax=3 ubuntu@157.151.255.227 'bash /home/ubuntu/intent-executor-VM.sh 8'
```

## Regra para relatórios

Todo relatório de executor deve informar:

- ambiente: PC ou VM;
- funções executadas;
- status de cada função;
- detalhes relevantes;
- pendências;
- se houve erro;
- se a ação alterou algo.

## Estado conhecido antes da expansão

No PC já havia funções de 1 a 6, sendo a função 6 criada para:

```text
Criar e validar backup Git
```

Na VM já havia funções operacionais de validação e backup PostgreSQL.

Este contrato formaliza a expansão para que PC e VM passem a compartilhar a mesma numeração.
