# Intent — Contrato de Continuidade entre Chats e Agentes

Este documento define as regras estáveis do projeto Intent para evitar perda de contexto, confusão entre histórico e estado vigente, sobrescrita indevida de código oficial ou avanço sem validação.

## 1. Fonte de verdade

A fonte de verdade oficial do projeto é:

- Repositório oficial: `edinhogrubert/Intent`
- Branch oficial: `main`

O laboratório `intentNew` é apenas ambiente de implementação, teste e transferência. Código do laboratório nunca deve ser tratado automaticamente como verdade oficial.

## 2. Separação obrigatória de informações

Toda resposta, handoff ou retomada deve separar:

1. **Estado confirmado** — algo verificado em GitHub, ambiente local, VM, PR, commit, release ou teste executado.
2. **Proposta** — ideia, plano, recomendação ou próximo bloco ainda não implementado.
3. **Histórico** — algo que aconteceu antes, mas que pode não ser mais o estado vigente.
4. **Pendência** — algo conhecido que ainda precisa ser feito.
5. **Bloqueio** — algo que impede merge, release, deploy ou avanço.

Nunca tratar histórico como estado vigente.

## 3. Papéis dos agentes

### 3.1 Agente de Implementação de Laboratório

Responsável por implementar e testar no laboratório `intentNew`.

Regras:

- Trabalha somente no laboratório.
- Não altera o repositório oficial diretamente.
- Não altera VM.
- Não faz deploy.
- Não faz merge na `main`.
- Não cria release/tag.
- Entrega código pronto, testes e handoff.
- Documenta arquivos alterados, decisões, testes, riscos e pendências.

### 3.2 Agente de Integração Oficial

Responsável por comparar laboratório e oficial, adaptar e integrar no repositório oficial.

Regras:

- Trabalha no repositório oficial `edinhogrubert/Intent`.
- Usa o laboratório como referência, não como ordem de sobrescrita.
- Faz integração cirúrgica.
- Preserva contratos existentes de API, autenticação, autorização, privacidade e UX já válida.
- Não reimplementa do zero sem necessidade.
- Não “melhora por gosto”.
- Bloqueia se houver divergência crítica, risco de privacidade, quebra de contrato, necessidade de migration não autorizada ou teste essencial falhando.

### 3.3 Agente Executor de Validação

Responsável por rodar comandos, testes, builds e validações locais ou em VM.

Regras:

- Não altera código sem autorização explícita.
- Não faz merge.
- Não cria tag/release.
- Não faz deploy sem autorização.
- Entrega lista de comandos executados e resultado de cada um.

## 4. Fluxo oficial de entrega

Fluxo padrão:

1. Definir bloco.
2. Implementar no laboratório `intentNew`.
3. Gerar handoff.
4. Publicar/sincronizar laboratório.
5. Integrar no oficial em branch própria.
6. Abrir ou atualizar PR.
7. Validar testes/builds.
8. Corrigir bloqueios.
9. Fazer merge na `main` somente com autorização.
10. Criar tag/release somente com autorização.
11. Fazer deploy na VM somente com autorização.
12. Validar produção.
13. Atualizar `ESTADO_ATUAL_INTENT.md`.

## 5. Regras de segurança operacional

Nunca fazer sem autorização explícita:

- merge na `main`;
- deploy;
- alteração na VM;
- criação de tag;
- criação de release;
- migration de banco;
- alteração de contrato de API;
- alteração de autenticação/autorização;
- alteração de privacidade;
- exclusão de código oficial;
- sobrescrita ampla de arquivo oficial com versão de laboratório.

## 6. Regras sobre backend, API e banco

- Prisma/migrations só podem ser alterados se houver necessidade real comprovada.
- Mudança de API deve documentar endpoint afetado, parâmetro/campo alterado, compatibilidade com chamadas antigas, impacto em frontend e impacto em testes.
- Identidade do usuário autenticado vem do backend/autenticação, não de `userId` enviado pelo cliente para ações protegidas.
- Frontend não deve depender de mock/localStorage como fluxo oficial de produção.
- Regras de visibilidade e privacidade devem ser preservadas.

## 7. Regras de handoff

Toda entrega precisa documentar:

- bloco;
- objetivo;
- branch;
- commit base;
- commit final, se houver;
- arquivos alterados;
- decisões tomadas;
- o que foi preservado;
- o que foi descartado e por quê;
- testes executados;
- resultado dos testes;
- pendências reais;
- riscos;
- confirmação de que não houve merge/tag/release/deploy/VM, se aplicável.

## 8. Regra de estado atual

O arquivo `ESTADO_ATUAL_INTENT.md` deve ser atualizado sempre que ocorrer:

- novo bloco iniciado;
- commit criado;
- PR aberto/atualizado;
- teste executado;
- bloqueio encontrado;
- bloqueio corrigido;
- merge;
- release/tag;
- deploy;
- validação em produção.

## 9. Regra de resposta entre chats

Ao iniciar novo chat, o assistente deve primeiro ler o pacote de continuidade e responder com:

- estado atual confirmado;
- bloqueios atuais;
- próximo passo seguro;
- ações proibidas no momento.

Não deve inventar estado nem assumir que algo foi feito sem confirmação.
