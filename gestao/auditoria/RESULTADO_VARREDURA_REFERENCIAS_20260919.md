# Resultado da varredura de referências — 2026-09-19

**Escopo:** branch `chore/auditoria-gestao-v1-20260918`, commit executado `e6474a40f62755c5f8acc1bc006365934a0d353c`. Fonte reproduzível: [GitHub Actions, execução 153](https://github.com/edinhogrubert/Intent/actions/runs/35414549302), job Scripts Oracle, artefato `inventario-referencias-gestao` (ID `10575282636`). Este relatório registra o resultado real, não declara validação da `main` ou dos ambientes instalados.

## Resultado obtido

O job de inventário terminou com sucesso e publicou o JSON. O log registra **292 arquivos textuais examinados, 118 linhas com padrões de referência antiga e 15 destinos de links Markdown ausentes**. O script retorna código zero mesmo na presença de achados: sucesso do job significa execução do inventário, **não aprovação dos links**. A verificação sintática dos executores e os destinos pontuais de continuidade também passaram nesse job. O backend ainda estava em andamento quando conferido; conferir a conclusão do workflow separadamente.

### Destinos ausentes identificados no artefato

| Arquivo | Linhas | Links relatados | Correção a validar |
| --- | --- | --- | --- |
| `gestao/arquitetura/arquitetura-mvp.md` | 36, 39, 40, 71–75 | `../backend/prisma/schema.prisma`, `../backend/prisma/migrations`, `../backend/docker-entrypoint.sh`, `../backend/compose.yaml`, `../deploy/oracle/frontend.compose.yaml`, `../deploy/oracle/frontend.nginx.conf`, `../src/services/intentApi.ts`, `../ProximasFuncionalidades.md` | Dos diretórios `gestao/arquitetura/`, os caminhos técnicos exigem `../../backend/`, `../../deploy/`, `../../src/`; o documento de planejamento foi preservado em `../produto/ProximasFuncionalidades.md` (confirmar destino e classificação). |
| `gestao/arquitetura/arquitetura-mvp.md` | 81–83 | `implantacao-oracle.md`, `recuperacao-completa.md`, `backups-e-rollback.md`, `fluxo-git-vm.md` | Os quatro procedimentos residem em `../operacao/`. |
| `gestao/operacao/recuperacao-completa.md` | 40 | `arquitetura-mvp.md` | O alvo está em `../arquitetura/arquitetura-mvp.md`. |
| `gestao/operacao/backups-e-rollback.md` | 5 | `../ProximasFuncionalidades.md` | O alvo está em `../produto/ProximasFuncionalidades.md`. |
| `gestao/operacao/implantacao-oracle.md` | 53 | `../deploy/oracle/08-deploy-backend.sh` | A partir de `gestao/operacao/`, caminho técnico `../../deploy/oracle/08-deploy-backend.sh`. |

**Classificação:** são 15 falhas concretas de resolução de links, não simples menções históricas. Corrigir nos quatro arquivos de origem e executar novamente o verificador; não editar comandos de implantação durante correções de navegação. A tabela descreve caminhos relativos propostos, não registra correções já efetuadas.

### Referências antigas: interpretação

Os 118 achados são **linhas correspondentes ao padrão**, não 118 links inválidos nem 118 arquivos diferentes. O padrão identifica inclusive links válidos relativos `contratos/` dentro de `gestao/governanca/`, código do próprio verificador, listas de proveniência, documentação de blocos antigos, a referência `docs/contratos-agentes` no bootstrap, ocorrências de texto no frontend e registros em `archive/`. É necessário distinguir referência ativa que abre arquivo, menção histórica e falso positivo. Não aplicar substituição global indiscriminada.

## Próximo aceite

1. Corrigir os 15 links relatados sem mudar instruções técnicas nem apagar histórico; conferir o novo JSON para zero links ausentes.
2. Classificar os padrões antigos restantes por consumidor ativo, histórico e falso positivo; revisar o bootstrap separadamente antes de qualquer mudança.
3. Confirmar CI integral no commit final e auditar diff contra `main`, incluindo conteúdo e modos de scripts.

**Situação da fase 5:** varredura integral de arquivos textuais cobertos pelo script executada; 15 links quebrados comprovados e correção pendente. **Integração: bloqueada**. Não fazer merge, instalar executores ou executar deploy por causa desta auditoria.
