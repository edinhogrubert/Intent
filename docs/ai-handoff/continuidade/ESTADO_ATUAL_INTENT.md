# Intent — Estado Atual Oficial

Atualizado em: 2026-09-19 BRT

## 1. Projeto

- Projeto: Intent
- Repositório oficial: `edinhogrubert/Intent`
- Branch oficial: `main`
- Laboratório: `intentNew`
- VM oficial: existe, mas não deve ser alterada sem autorização explícita.

## 2. Estado operacional vigente

- Última tag criada: `mvp-1.0.23`.
- Próxima release planejada: `mvp-1.0.24`
- Release `mvp-1.0.24` ainda NÃO foi criada.
- `main` no GitHub, nos dois clones locais e na VM: `cc132fb5005d924a9e2fe387807fac5623bdbe0d`.
- Frontend e API em execução foram comparados com imagens temporárias construídas a partir dessa `main`; os artefatos de runtime correspondem.
- A Home horizontal do PR #31 está implantada. Não houve alteração de banco, Prisma, Firebase ou tag/release nesta atualização.

## 3. Estado da codificação

- Bloco 25 e as correções operacionais posteriores estão integrados e implantados.
- Bloco 26 permanece apenas como proposta, sem implementação oficial.

Permitido neste momento:

1. Criar tag/release `mvp-1.0.24`, quando autorizado.
2. Correção mínima apenas se surgir erro crítico de release/deploy/produção.

Proibido neste momento:

- iniciar Bloco 26 antes de uma nova autorização;
- criar migration sem necessidade crítica comprovada;
- mudar contrato de API sem necessidade crítica comprovada;
- refatorar código sem relação direta com uma entrega autorizada.

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
- Deploy: realizado como parte da sincronização da `main` atual na VM; artefatos frontend/API comparados com build reprodutível em 2026-09-19 BRT.
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

## 7. Fechamento operacional em 2026-09-19

Integrações adicionais após o Bloco 25:

- PR #31 — Home horizontal: merge `f340cb757241c03766239327219427fc5d644e35`; CI aprovada; frontend implantado.
- PR #32 — isolamento das funções 8 e 13: merge `9313ade2ee294d29c364098e34bae923e4ae14cc`; CI aprovada.
- PR #33 — sincronização VM sem colisão de tags: merge `cc132fb5005d924a9e2fe387807fac5623bdbe0d`; CI aprovada.
- Função VM 7 sincronizada com `fetch --no-tags --prune`; função 13 validada sem registrar a função 8.
- Backup PostgreSQL local validado pela função VM 5 e cópia externa local validada por SHA-256.

Pendência de governança:

- Criar tag/release `mvp-1.0.24` somente mediante autorização específica.

## 8. Próximo bloco planejado

Após uma nova autorização de desenvolvimento:

- Bloco 26 proposto: Descoberta Social e Busca.

Ideia inicial:

- 26A — Busca global.
- 26B — Tela Explorar/Descobrir.
- 26C — Sugestões sociais simples.

Estado do Bloco 26:

- Proposta apenas.
- Ainda não iniciado.
- Não existe implementação oficial.
- Não iniciar sem autorização específica.
