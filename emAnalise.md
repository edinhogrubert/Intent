# Em análise — inventário documental do Intent

> Registro criado em 20/09/2026 a pedido do proprietário. **Inventário para organização posterior, não decisão de exclusão, migração, atualização de contratos ou alteração de código.**
>
> Escopo: arquivos não executáveis (documentação, acordos, contratos, relatórios e handoffs) identificados na `main` do repositório `edinhogrubert/Intent` durante o levantamento anterior. Os diretórios `archive/` e `Nova pasta/` são **histórico pessoal do proprietário: não ler nem usar como fonte vigente salvo solicitação explícita.** O inventário é um retrato pontual, não uma garantia de completude após novos commits.
>
> Critério: documentação não é código de aplicação, embora documentos operacionais e README possam ser importantes para manutenção. **Não apagar ou mover nada com base somente nesta listagem.** Arquivos `.json`, `.yaml`, `.sh`, `.ts`, `.tsx`, configurações, migrações, assets e demais artefatos técnicos não foram classificados como documentação.

## 1. Raiz

```text
AGENTS.md
JIRA.md
ProximasFuncionalidades.md
projatual.md
projetocompleto.md
revisar.md
visaodedoisenior.md
```

## 2. contratos/

```text
contratos/ARQUITETURA_ATUAL_PC.md
contratos/ARQUITETURA_ATUAL_VM.md
contratos/CONTRATO_AGENTES_LABORATORIO_INTEGRACAO.md
contratos/CONTRATO_AGENTE_SENIOR_CHATGPT.md
contratos/FLUXO_FUNCIONALIDADE.md
contratos/INTERFACE_EXECUTORES.md
contratos/MAPA_SCRIPTS_OPERACIONAIS.md
contratos/README.md
```

## 3. docs/

```text
docs/RECUPERACAO_MAIN.md
docs/arquitetura-mvp.md
docs/backend-authority-f0.md
docs/backups-e-rollback.md
docs/fluxo-git-vm.md
docs/implantacao-oracle.md
docs/intent-comments.md
docs/minimal-notifications.md
docs/recuperacao-completa.md
docs/simple-search.md
```

## 4. docs/ai-handoff/

```text
docs/ai-handoff/GEMINI_BACKEND_INTENT.md
docs/ai-handoff/bloco-12-home-social-3-colunas.md
docs/ai-handoff/bloco-12-migracao-codex.md
docs/ai-handoff/bloco-13-reacoes-intents.md
docs/ai-handoff/bloco-14-notificacoes-sociais.md
docs/ai-handoff/bloco-15-central-notificacoes-frontend.md
docs/ai-handoff/bloco-16-navegacao-notificacoes-intent.md
docs/ai-handoff/bloco-17-polimento-social-intent.md
docs/ai-handoff/bloco-18-feed-social-vivo.md
docs/ai-handoff/bloco-19-perfil-social-publico.md
docs/ai-handoff/bloco-20-perfil-social-mais-vivo.md
docs/ai-handoff/bloco-21-seguir-usuarios.md
docs/ai-handoff/bloco-22-identidade-social-do-usuario.md
docs/ai-handoff/bloco-23-feed-de-seguidos.md
docs/ai-handoff/bloco-24-atividade-publica-perfil.md
docs/ai-handoff/bloco-25a-links-compartilhaveis.md
docs/ai-handoff/bloco-25b-edicao-perfil.md
docs/ai-handoff/bloco-25c-filtros-atividade.md
docs/ai-handoff/bloco-30-32-descoberta-social.md
```

## 5. Relatórios dos blocos 20–23

```text
docs/ai-handoff/block-20/diff/arquivos-alterados.md
docs/ai-handoff/block-20/reports/resumo-implementacao.md
docs/ai-handoff/block-20/reports/validacoes.md

docs/ai-handoff/block-21/diff/arquivos-alterados.md
docs/ai-handoff/block-21/reports/resumo-implementacao.md
docs/ai-handoff/block-21/reports/validacoes.md

docs/ai-handoff/block-22/diff/arquivos-alterados.md
docs/ai-handoff/block-22/reports/resumo-implementacao.md
docs/ai-handoff/block-22/reports/validacoes.md

docs/ai-handoff/block-23/diff/arquivos-alterados.md
docs/ai-handoff/block-23/reports/resumo-implementacao.md
docs/ai-handoff/block-23/reports/validacoes.md
```

## 6. Continuidade

```text
docs/ai-handoff/continuidade/CONTRATO_CONTINUIDADE_INTENT.md
docs/ai-handoff/continuidade/ESTADO_ATUAL_INTENT.md
docs/ai-handoff/continuidade/PROMPT_RETOMADA_CHATGPT.md
```

## 7. Documentação dentro de componentes técnicos

```text
backend/README.md
scripts/executores/README.md
```

## 8. Contexto e critérios para a revisão futura (não executar agora)

- O proprietário deseja contratos mais estruturados e duradouros do que o histórico de conversa, para preservar acordos e regras entre diferentes IAs/agentes, inclusive quando a conversa crescer. O arquivo `AGENTS.md` e os documentos em `contratos/` e `docs/ai-handoff/continuidade/` são candidatos a uma revisão **futura**, não foram auditados neste registro.
- Distinguir contratos normativos, visão de produto, backlog de ideias, estado operacional vigente, documentação técnica, relatórios de entrega e registros históricos. Nome e localização não provam que o conteúdo é vigente.
- `ProximasFuncionalidades.md` é o arquivo canônico para registrar acordos de funcionalidades futuras; editar diretamente na `main`, sem issue, branch nem PR, quando a mudança for exclusivamente documental e explicitamente solicitada.
- Alterações de código, infraestrutura, schema/migrations e configuração operacional mantêm processo específico de implementação, testes e validação; um acordo documental não autoriza implementação.
- Ao reorganizar: comparar conteúdos e dependências antes de decidir manter, fundir, arquivar ou excluir; conservar fatos e histórico relevante; não tratar versões históricas ou SHA antigo como estado atual. Revisar referências cruzadas e pontos de entrada dos agentes.
- `archive/` e `Nova pasta/`: excluídos do inventário e não são fontes para revisão, salvo pedido explícito do proprietário.
- Na data deste registro, **nenhum dos documentos listados foi lido integralmente para avaliar duplicação, vigência ou utilidade**. A classificação é apenas por nome/caminho e posição no repositório. Não foi feita alteração, movimentação ou exclusão deles.

## 9. Estado desta solicitação

Somente criação de `emAnalise.md` diretamente na `main`. Nenhum outro arquivo, contrato, documentação existente, código, configuração, migração, branch ou issue deve ser alterado por esta solicitação.
