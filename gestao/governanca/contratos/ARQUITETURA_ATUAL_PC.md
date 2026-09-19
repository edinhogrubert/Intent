# Arquitetura Atual do PC Local — Projeto Intent

Atualizado em: 2026-09-18

Este documento é o contrato para recriar uma estação de desenvolvimento e integração do Intent em outro computador. Ele complementa `ARQUITETURA_ATUAL_VM.md`: o PC reproduz a aplicação localmente, mas não deve copiar segredos, dados, rede, containers ou rotinas de produção da VM.

## Como usar este contrato em outro PC

Antes de propor, instalar ou executar qualquer mudança, o agente deve ler, nesta ordem:

1. `gestao/governanca/contratos/README.md`
2. `gestao/governanca/contratos/ARQUITETURA_ATUAL_PC.md`
3. `gestao/governanca/contratos/INTERFACE_EXECUTORES.md`
4. `gestao/governanca/contratos/ARQUITETURA_ATUAL_VM.md` somente quando a tarefa envolver VM ou deploy.

Os contratos nesta branch de reorganização estão em `gestao/governanca/contratos/`. O endereço histórico `docs/contratos-agentes/contratos` não é a localização canônica desta branch. A `main` permanece oficial até integração autorizada.

## Regra principal

Sempre que mudar ferramenta obrigatória, versão mínima, diretório operacional, variável de ambiente, modo de executar testes, executor local ou integração externa, este arquivo deve ser atualizado no mesmo ciclo da alteração.

Nenhum agente deve presumir que o PC é uma cópia da VM. O PC é um ambiente isolado de desenvolvimento; VM, deploy, banco de produção, Redis de produção e chaves de produção permanecem fora dele.

## Fotografia do PC de referência

Esta é uma observação da estação que gerou este contrato, e não uma exigência de hardware para todas as máquinas.

| Item | Valor observado |
|---|---|
| Sistema operacional | Ubuntu 26.04.1 LTS (Lubuntu) |
| Kernel / arquitetura | Linux 7.0.0-31-generic, x86_64 |
| Usuário / hostname | `grubert` / `lubuntu` |
| Memória / swap no registro | 30 GiB / 512 MiB |
| Volume do checkout | 144 GiB total; 86 GiB livres no registro |
| Node.js | `v22.22.1` |
| npm | `9.2.0` |
| Git | `2.53.0` |
| Docker Engine | `29.1.3` |
| Docker Compose | `2.40.3` |
| OpenSSH | `10.2p1` |

O backend declara `node >=22`. Use Node 22 LTS ou versão posterior compatível. O lockfile do frontend é Bun; a CI usa Bun `1.4.0`. Instale essa versão quando for reproduzir o fluxo de frontend. Não substitua gerenciadores de pacote nem regenere lockfiles sem uma mudança deliberada no repositório.

## Código e Git

- Repositório oficial: `edinhogrubert/Intent`
- Remoto canônico: `https://github.com/edinhogrubert/Intent.git`
- Branch de integração e publicação: `main`
- Checkout operacional observado: `/home/grubert/Projetos/Intent-local`
- HEAD observado neste registro: `ac3fb24828607940d611a4704c09dc08b0401acf` (`Merge PR #26: complete block 25`)

O hash acima é apenas a fotografia de 2026-09-18. Em um PC novo, clone o repositório oficial, consulte `origin/main` e trabalhe a partir da base atual; não fixe o ambiente a esse hash histórico.

O caminho pode mudar numa máquina nova. Porém, o executor PC atual foi escrito com os valores `grubert`, `lubuntu` e `/home/grubert/Projetos/Intent-local`. Para usá-lo sem alteração, recrie esse caminho. Para outro usuário, hostname ou caminho, adapte o executor de forma versionada e atualize este contrato e `INTERFACE_EXECUTORES.md`; não esconda a diferença com links simbólicos ou scripts soltos.

## Componentes da aplicação

### Frontend

- React 19, Vite 6, TypeScript e Tailwind 4.
- Desenvolvimento: `npm run dev`, em `http://localhost:3000`.
- Validações: `npm run lint` e `npm run build` na raiz.
- Autenticação de cliente: Firebase Auth, configurado por `firebase-applet-config.json`.

O arquivo de configuração Firebase presente no checkout é parte do contexto local do frontend. Em outra máquina/projeto Firebase, use uma configuração Firebase própria e autorizada. Não copie arquivos de credencial privados, tokens de sessão ou contas locais de outro computador.

### Backend

- Node.js, Express, Prisma, PostgreSQL e Firebase Admin.
- Diretório: `backend/`.
- Desenvolvimento: `npm run dev`.
- Porta padrão: `8080`.
- Saúde: `GET /health/ready`.
- Validações: `npm test`, `npm run lint`, `npm run build`.
- Prisma: `npm run prisma:generate`; migrations por `npm run db:migrate`.

O backend exige estas variáveis, documentadas em `backend/.env.example`:

| Variável | Finalidade |
|---|---|
| `NODE_ENV` | ambiente (`development`, `test` ou `production`) |
| `PORT` | porta HTTP, padrão `8080` |
| `LOG_LEVEL` | nível de log |
| `CORS_ORIGINS` | origens permitidas; localmente `http://localhost:3000` |
| `DATABASE_URL` | conexão exclusiva do PostgreSQL local |
| `FIREBASE_PROJECT_ID` | projeto Firebase autorizado para o ambiente local |
| `REVEAL_ENCRYPTION_KEY` | chave Base64 de exatamente 32 bytes |

Gere uma nova `REVEAL_ENCRYPTION_KEY` por ambiente com `openssl rand -base64 32`. O Firebase Admin usa Application Default Credentials: configure uma conta de serviço própria e segura para o projeto Firebase local, por mecanismo suportado pelo SDK. Nunca versione seu JSON de credencial nem acrescente seu caminho ao Git.

### Dados locais

- PostgreSQL é obrigatório para executar a API de verdade e migrations.
- Redis é um componente conhecido da VM, mas não é variável obrigatória da configuração atual do backend nem havia container de Redis local em execução quando este contrato foi registrado.
- Não aponte `DATABASE_URL` para a VM, staging ou produção.

O arquivo `backend/compose.yaml` é uma receita de runtime da VM: usa `/opt/intent/runtime/backend.env`, um segredo montado em `/opt/intent/secrets/`, rede externa `intent-private` e bind em loopback. Ele **não** é uma receita de bootstrap para outro PC. Crie/execute PostgreSQL local isolado, ou use o mecanismo efêmero de testes; não replique nomes, volumes ou segredos da VM.

## Bootstrap seguro de outro PC

1. Instale Git, OpenSSH, Node 22, npm, Docker Engine e Docker Compose. Garanta que o usuário local tenha acesso ao daemon Docker antes de depender dele.
2. Instale Bun `1.4.0`, a versão atual da CI para o frontend.
3. Crie uma chave SSH exclusiva para aquele computador, por exemplo `~/.ssh/id_ed25519_intent`, e cadastre **apenas a chave pública** na conta ou no acesso GitHub apropriado. Não reutilize chave de deploy da VM.
4. Clone `edinhogrubert/Intent`, entre no checkout e confirme `origin/main`. Crie uma branch de trabalho; não desenvolva diretamente em `main`.
5. Instale dependências sem copiar `node_modules`, `dist`, `coverage` ou caches: `bun install --frozen-lockfile` na raiz e `npm ci` em `backend/`. Use os lockfiles existentes.
6. Crie `backend/.env` somente local, baseado em `backend/.env.example`, com PostgreSQL e Firebase exclusivos daquele PC/projeto. Mantenha-o ignorado.
7. Suba um PostgreSQL local isolado, configure `DATABASE_URL`, execute `npm run prisma:generate` e aplique as migrations pelo Prisma no banco local.
8. Inicie backend e frontend em terminais separados (`backend/npm run dev` e `npm run dev` na raiz). Confirme a API local e o frontend antes de editar.

O `.env.example` na raiz não é contrato de backend e pode conter material histórico de laboratório. Para a API, a fonte de verdade é `backend/.env.example` e `backend/src/config.ts`.

## Testes e isolamento

Para validação normal, execute os scripts do repositório, sem apontar a serviços externos:

```text
raiz:    npm run lint && npm run build
backend: npm test && npm run lint && npm run build
```

O teste PostgreSQL oficial é `backend/npm run test:postgres`. Ele exige `TEST_DATABASE_URL` com host `localhost` ou `127.0.0.1` e banco com nome `intent_test_*`; o próprio teste rejeita URLs fora desse padrão. Use um banco descartável, nunca o banco local de desenvolvimento compartilhado e jamais um banco da VM.

O Docker local deve conter apenas serviços explicitamente iniciados para o PC. No registro desta arquitetura, a consulta ao daemon Docker exigia permissão do usuário; portanto não há lista confiável de containers locais que deva ser replicada. Resolva acesso ao daemon antes de criar a rotina local de dados.

## Segredos e identidades separadas

Em outro PC, crie ou obtenha autorização para recursos próprios:

- chave SSH própria para GitHub;
- projeto/configuração Firebase próprios, ou credenciais de desenvolvimento fornecidas de modo seguro;
- conta de serviço Firebase Admin própria;
- PostgreSQL local próprio;
- chave de criptografia de revelação própria;
- sessões, tokens e arquivos `.env` próprios.

É proibido copiar da VM ou de outro PC: `.env` reais, JSON de service account, chaves privadas SSH, `known_hosts` sensível, dumps de produção, volumes Docker, tokens de navegador ou caches de autenticação.

## Executor PC e backup

O executor registrado no PC de referência fica em:

```bash
bash /home/grubert/intent-automacao/intent-executor-PC.sh <funcao>
```

Ele implementa atualmente as funções 1 a 6. As funções 1 a 5 são inspeções; a função 6 cria e valida um Git bundle, portanto **altera** o backup. O executor tem caminhos e uma referência de release histórica fixados; antes de copiá-lo para outro PC, revise-os e atualize a rotina de backup para a release aprovada atual. A numeração e intenção das funções são definidas em `INTERFACE_EXECUTORES.md`.

Não trate o executor como parte do clone Git: ele está fora do repositório e precisa ser instalado, revisado e testado separadamente na nova máquina.

## O que não pertence ao PC local

Não execute a partir do PC, salvo autorização explícita e contrato da VM:

- deploy, restart ou migração no ambiente oficial;
- comandos SSH destrutivos na VM;
- alteração de firewall, portas públicas, redes ou Docker da VM;
- tag, release ou merge em nome de uma validação local;
- uso do banco ou Redis oficiais para testes.

Para essas tarefas, leia `ARQUITETURA_ATUAL_VM.md` e use o executor VM quando existir função correspondente.

## Regra para PRs e releases

Todo PR ou release relevante deve declarar um destes estados:

```text
Arquitetura PC: sem mudança
```

ou:

```text
Arquitetura PC: alterada
Arquivo atualizado: gestao/governanca/contratos/ARQUITETURA_ATUAL_PC.md
```

Atualize também `ARQUITETURA_ATUAL_VM.md` somente se a mudança afetar a VM. Um contrato não substitui o outro.
