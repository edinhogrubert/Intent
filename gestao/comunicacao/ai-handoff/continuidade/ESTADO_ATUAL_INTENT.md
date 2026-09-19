# Intent — Estado Atual Oficial

Atualizado em: 2026-09-18 00:13 BRT

## 1. Projeto

- Projeto: Intent
- Repositório oficial: `edinhogrubert/Intent`
- Branch oficial: `main`
- Laboratório: `intentNew`
- VM oficial: existe, mas não deve ser alterada sem autorização explícita.

## 2. Release oficial vigente

- Release operacional vigente antes do Bloco 25: `mvp-1.0.23`
- Próxima release planejada: `mvp-1.0.24`
- Release `mvp-1.0.24` ainda NÃO foi criada.
- Deploy do Bloco 25 na VM ainda NÃO foi feito.

## 3. Estado da codificação

- Codificação: TRAVADA.
- Novo bloco: PROIBIDO iniciar agora.
- Bloco 26: apenas proposta, NÃO iniciado.

Permitido neste momento:

1. Fechamento operacional do Bloco 25.
2. Tag/release `mvp-1.0.24`, quando autorizado.
3. Deploy na VM, quando autorizado.
4. Validação pós-deploy.
5. Correção mínima apenas se surgir erro crítico de release/deploy/produção.

Proibido neste momento:

- criar funcionalidade nova;
- iniciar Bloco 26;
- alterar frontend por melhoria visual;
- alterar backend por melhoria opcional;
- criar migration sem necessidade crítica comprovada;
- mudar contrato de API sem necessidade crítica comprovada;
- refatorar código sem relação direta com release/deploy.

## 4. Bloco 25

Bloco concluído:

- Bloco 25 — Perfis sociais, links compartilháveis e atividade pública.

Partes entregues:

- 25A — Links compartilháveis: concluído.
- 25B — Edição completa de perfil social: concluído.
- 25C — Filtros da atividade pública: concluído e corrigido.

## 5. PR #26

- PR: `#26`
- URL: `https://github.com/edinhogrubert/Intent/pull/26`
- Branch usada: `feat/shareable-links`
- Head integrado: `f407841856f7a6359855adb07c00e0c860ec937d`
- Merge commit na `main`: `ac3fb24828607940d611a4704c09dc08b0401acf`
- Estado: MERGED
- Merged at: `2026-09-18T03:30:06Z`
- Deploy: NÃO realizado
- Release/tag: NÃO criadas

## 6. Validações reportadas antes do merge

Testes específicos incluídos na suíte completa:

- Links: `27/27` PASS
- Edição: `26/26` PASS
- Atividade: `20/20` PASS
- Atividade, links, edição e nova regressão: `83/83` PASS
- Suíte backend completa: `300/300` PASS
- Lint frontend: PASS
- Build frontend: PASS
- Build backend: PASS
- `git diff --check`: PASS

Validação funcional:

### 25A

- Parsing aprovado.
- Navegador preservou URLs e AuthGate.
- Abertura do recurso após login ainda pendente.

### 25B

- Edição e proteção de campos passaram nos testes HTTP/schema.
- Interação autenticada no navegador ainda pendente.

### 25C

- “Todos”, “Criações” e “Apoios” passaram no serviço com PostgreSQL real.
- Paginação de Todos/Criações passou.
- Race condition de troca de filtro foi corrigida.
- Regressão coberta no harness do componente real.

## 7. Pendências atuais

Pendências de fechamento:

1. Criar tag/release `mvp-1.0.24`, quando autorizado.
2. Fazer deploy do Bloco 25 na VM, quando autorizado.
3. Validar produção.
4. Atualizar este estado após release/deploy.

Pendências funcionais não bloqueantes registradas:

- Verificação visual autenticada ainda pendente porque a sessão local não estava autenticada.

## 8. Próximo bloco planejado

Após fechar release/deploy do Bloco 25:

- Bloco 26 proposto: Descoberta Social e Busca.

Ideia inicial:

- 26A — Busca global.
- 26B — Tela Explorar/Descobrir.
- 26C — Sugestões sociais simples.

Estado do Bloco 26:

- Proposta apenas.
- Ainda não iniciado.
- Não existe implementação oficial.
- Não iniciar enquanto release/deploy/validação do Bloco 25 não forem encerrados.
