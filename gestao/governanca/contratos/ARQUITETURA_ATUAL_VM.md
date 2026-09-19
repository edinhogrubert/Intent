# Arquitetura Atual da VM — Projeto Intent

Atualizado em: 2026-09-18

Este documento registra a arquitetura operacional atual do projeto Intent na VM oficial e as regras para manter essa arquitetura recriável por uma pessoa, pelo ChatGPT ou por outro agente.

O objetivo não é apenas explicar o que existe hoje. O objetivo é garantir que, se o projeto precisar ser recriado do zero, o agente tenha informação suficiente para reconstruir o ambiente com fidelidade, sem depender de memória solta da conversa.

## Regra principal

Sempre que houver mudança significativa de infraestrutura, deploy, serviços, portas, banco, variáveis, diretórios, backup, domínio, executores ou forma de publicação, este arquivo deve ser atualizado no mesmo ciclo da mudança.

Nenhum agente deve tratar uma alteração significativa como concluída se ela mudou a arquitetura e este documento não foi atualizado.

## Estado oficial conhecido

### Repositório

- Repositório oficial: `edinhogrubert/Intent`
- Branch oficial: `main`
- Diretório do código na VM: `/opt/intent/source`
- Método de acesso da VM ao GitHub: deploy key somente leitura
- Deploy key registrada historicamente como: `SSHintent-app-01 Ashburn`

### VM oficial

- Provedor: Oracle Cloud Free Tier
- Região efetiva: US East / Ashburn
- Nome da VM: `intent-app-01`
- Sistema operacional: Ubuntu 24.04.4 LTS ARM64
- Shape: `VM.Standard.A1.Flex`
- CPU/memória registrados: 2 OCPUs / 12 GB RAM
- Disco registrado: 50 GB
- Timezone: `America/Sao_Paulo`
- Hostname: `intent-app-01`
- Swap registrado: 2 GB

### Diretórios operacionais

- Base operacional: `/opt/intent`
- Código oficial: `/opt/intent/source`
- Backups PostgreSQL: `/opt/intent/backups/postgres`
- Logs de backup PostgreSQL: `/opt/intent/logs/postgres-backup.log`

### Containers e serviços conhecidos

Serviços de dados conhecidos:

- PostgreSQL: container `intent-postgres`
- Redis: container `intent-redis`

Estado registrado antes deste contrato:

- Frontend: UP
- Backend: UP
- PostgreSQL: UP
- Redis: UP

Observação importante: nomes exatos de containers, serviços systemd, portas internas e comandos de restart do frontend/backend devem ser confirmados pelo executor da VM. O ChatGPT não deve inventar nomes de serviço.

## Stack da aplicação

### Frontend

- React
- Vite
- TypeScript
- Tailwind

### Backend

- Node.js
- Express
- Prisma
- PostgreSQL
- Redis
- Firebase Auth para autenticação

### Banco e cache

- PostgreSQL como banco relacional principal
- Redis para cache, locks, filas simples ou contadores operacionais quando aplicável

### Storage futuro/planejado

- S3 compatível para objetos e arquivos, usando URLs assinadas quando aplicável

Se o storage real for implantado ou alterado, este documento deve ser atualizado com provedor, bucket, região, política de acesso e fluxo de backup.

## Segurança e rede

Estado histórico registrado:

- UFW ativo com política restritiva
- SSH restrito à origem autorizada
- PostgreSQL e Redis sem exposição direta no host público

Regra obrigatória:

- O banco de dados e o Redis não devem ser expostos diretamente à Internet.
- Portas públicas, domínio, proxy reverso, TLS e regras de firewall devem ser documentados aqui sempre que forem alterados.
- O ChatGPT não deve assumir que portas `80` e `443` estão abertas ou fechadas sem relatório recente do executor da VM.

## Configuração sensível

As configurações sensíveis não devem ser gravadas no Git.

Exemplos de itens que devem existir apenas na VM, secret manager ou ambiente seguro:

- `DATABASE_URL`
- `REDIS_URL`
- credenciais Firebase
- chaves de sessão ou JWT, se existirem
- segredos de storage S3, se existirem
- credenciais de e-mail, webhook ou integração externa

Regra:

- Este documento deve listar nomes e finalidade das variáveis necessárias.
- Este documento não deve listar valores secretos.
- Se uma variável nova se tornar obrigatória, este documento deve ser atualizado.

## Backup

### PostgreSQL

Estado registrado:

- Backup local diário
- Horário registrado: 03:15
- Retenção registrada: 7 dias
- Diretório: `/opt/intent/backups/postgres`
- Log: `/opt/intent/logs/postgres-backup.log`

### Git

No PC existe fluxo de backup Git controlado pelo executor local.

Função conhecida:

- Função 6: criar e validar backup Git

Regra:

- Antes de release, deploy ou alteração estrutural, deve haver backup válido.
- Se o mecanismo de backup mudar, atualizar este documento e a interface dos executores.

## Executores operacionais

O projeto usa executores para impedir comandos soltos.

### PC

Executor oficial do PC:

```bash
bash /home/grubert/intent-automacao/intent-executor-PC.sh <funcao>
```

### VM

Executor oficial da VM:

```bash
bash /home/ubuntu/intent-executor-VM.sh <funcao>
```

A numeração das funções deve seguir o contrato:

- `contratos/INTERFACE_EXECUTORES.md`

Regra:

- PC e VM devem usar a mesma numeração.
- O número representa a intenção.
- Cada ambiente implementa conforme sua realidade.
- Se não se aplica, retorna `N/A`.
- O ChatGPT não deve mandar comandos manuais se existir função equivalente no executor.

## Como recriar a VM conceitualmente

Este é o roteiro humano de reconstrução. Ele não substitui scripts, mas define o que precisa existir.

### 1. Criar infraestrutura base

Criar VM Oracle Cloud compatível com:

- Ubuntu ARM64
- Shape Ampere A1 Flex
- 2 OCPUs
- 12 GB RAM
- 50 GB de disco, salvo decisão registrada em contrário
- timezone `America/Sao_Paulo`
- hostname `intent-app-01`, salvo nova convenção registrada

### 2. Preparar sistema operacional

Preparar o servidor com:

- usuário operacional autorizado
- acesso SSH restrito
- UFW ativo
- Docker instalado
- Docker Compose instalado
- swap configurado quando necessário
- diretório `/opt/intent` criado

Versões registradas historicamente:

- Docker 29.7.2
- Docker Compose v5.5.0

Se as versões mudarem, atualizar este documento.

### 3. Configurar acesso ao código

A VM deve acessar o repositório oficial:

- `edinhogrubert/Intent`

O código deve ficar em:

- `/opt/intent/source`

O acesso deve ser preferencialmente somente leitura para deploy, salvo necessidade registrada.

### 4. Configurar variáveis de ambiente

Criar os arquivos/variáveis necessários para backend, banco, cache e autenticação.

Não versionar segredos.

Este documento deve ser atualizado sempre que uma variável obrigatória for criada, removida ou renomeada.

### 5. Subir serviços de dados

Subir PostgreSQL e Redis por Docker/Compose conforme contrato vigente.

Validar:

- containers saudáveis
- conexão backend → PostgreSQL
- conexão backend → Redis
- PostgreSQL e Redis não expostos publicamente

### 6. Aplicar banco

Aplicar migrations Prisma conforme release implantada.

Regra:

- Nunca aplicar alteração manual no banco sem documentação.
- Toda migration deve estar versionada no repositório.
- Toda mudança Prisma/migration significativa deve atualizar este documento se afetar operação, deploy, backup ou restauração.

### 7. Build e publicação da aplicação

Construir frontend e backend conforme scripts oficiais do projeto.

Regra:

- O nome exato dos serviços de runtime deve ser obtido do executor ou da documentação operacional atual.
- O ChatGPT não deve inventar comando de restart.

### 8. Validar produção

Após deploy, validar no mínimo:

- containers ativos
- backend respondendo
- frontend respondendo
- endpoints essenciais respondendo
- banco acessível pelo backend
- Redis acessível quando aplicável
- commit/tag implantado corresponde à release esperada

## Mudanças significativas que obrigam atualização deste arquivo

Atualizar este documento se qualquer item abaixo mudar:

- região da VM
- shape, CPU, memória ou disco
- sistema operacional
- hostname
- timezone
- diretórios operacionais
- estratégia de clone/deploy
- branch ou tag usada em produção
- nomes de containers
- uso de Docker, Compose ou systemd
- portas públicas ou privadas
- proxy reverso
- domínio
- TLS/certificados
- firewall/UFW
- banco de dados
- Redis/cache/fila
- storage de arquivos
- variáveis de ambiente obrigatórias
- secrets necessários
- rotina de backup
- rotina de restore
- estratégia de release/tag
- scripts de executor PC/VM
- autenticação/autorização que afete operação
- qualquer dependência externa obrigatória

## Regra para PRs e releases

Todo PR ou release relevante deve declarar um destes estados:

```text
Arquitetura: sem mudança
```

ou:

```text
Arquitetura: alterada
Arquivo atualizado: contratos/ARQUITETURA_ATUAL_VM.md
```

Se a arquitetura mudou e este arquivo não foi atualizado, o PR/release não está completo.

## Estado após Bloco 25

Registro de continuidade:

- Bloco 25 foi mergeado na `main` via PR #26.
- Release planejada após o Bloco 25: `mvp-1.0.24`.
- Deploy pós-Bloco 25 ainda deve ser tratado como etapa separada, com autorização e relatório do executor.

Este documento deve ser revisado novamente após o deploy do `mvp-1.0.24` para registrar o estado real implantado na VM.
