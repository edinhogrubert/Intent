# Contratos Operacionais do Projeto Intent

Esta pasta guarda os contratos humanos do projeto Intent para que o trabalho não dependa de memória solta ou de uma conversa fora de contexto.

## Papéis

- **Agente Senior / ChatGPT**: orquestra, revisa e protege o processo.
- **Agente de Implementação de Laboratório**: implementa e testa fora da linha oficial.
- **Agente de Integração Oficial**: integra de forma cirúrgica no repositório oficial.
- **Executores PC/VM**: executam rotinas por funções numeradas.

Cada agente tem deveres, limites e uma forma de entregar resultados. Antes de automatizar, o processo deve ser compreensível por uma pessoa.

## Arquivos desta pasta

- `CONTRATO_AGENTE_SENIOR_CHATGPT.md`: regras do agente sênior.
- `INTERFACE_EXECUTORES.md`: interface numérica dos executores PC/VM.
- `FLUXO_FUNCIONALIDADE.md`: fluxo para implementar funcionalidades.
- `CONTRATO_AGENTES_LABORATORIO_INTEGRACAO.md`: responsabilidades de laboratório e integração.
- `ARQUITETURA_ATUAL_VM.md`: arquitetura operacional da VM.
- `ARQUITETURA_ATUAL_PC.md`: arquitetura e bootstrap seguro do PC.
- `MAPA_SCRIPTS_OPERACIONAIS.md`: mapa dos scripts auxiliares.

Caminho canônico desta pasta: `gestao/governanca/contratos/`. Índice de navegação: `gestao/governanca/INDICE_CONTRATOS_v2PC.md`.

## Executores técnicos

Os arquivos executáveis permanecem na raiz técnica do repositório, em `scripts/executores/`:

- `scripts/executores/intent-executor-PC.sh`
- `scripts/executores/intent-executor-VM.sh`
- `scripts/executores/instalar-executor-PC.sh`
- `scripts/executores/instalar-executor-VM.sh`

Este documento não autoriza instalar, executar ou atualizar executores.

## Ordem de autoridade documental

1. `gestao/governanca/contratos/CONTRATO_AGENTE_SENIOR_CHATGPT.md`
2. `gestao/governanca/contratos/INTERFACE_EXECUTORES.md`
3. `gestao/governanca/contratos/MAPA_SCRIPTS_OPERACIONAIS.md`
4. `gestao/governanca/contratos/ARQUITETURA_ATUAL_PC.md` para PC ou `gestao/governanca/contratos/ARQUITETURA_ATUAL_VM.md` para VM.
5. `gestao/governanca/contratos/FLUXO_FUNCIONALIDADE.md`
6. `gestao/governanca/contratos/CONTRATO_AGENTES_LABORATORIO_INTEGRACAO.md`
7. `gestao/comunicacao/ai-handoff/continuidade/CONTRATO_CONTINUIDADE_INTENT.md`
8. `gestao/comunicacao/ai-handoff/continuidade/ESTADO_ATUAL_INTENT.md`

Os registros de estado são fotografias datadas: devem ser confrontados com a branch, commits, código e testes antes de serem tratados como estado atual. A conversa não sobrescreve contratos sem decisão explícita do usuário.

## Execução e arquitetura recriável

Se houver executor para uma tarefa, use a interface numérica e o caminho absoluto previsto em `INTERFACE_EXECUTORES.md`, em vez de comandos auxiliares improvisados.

A arquitetura operacional deve continuar documentada em:

```text
gestao/governanca/contratos/ARQUITETURA_ATUAL_PC.md
gestao/governanca/contratos/ARQUITETURA_ATUAL_VM.md
```

Mudanças significativas em ferramentas, infraestrutura, deploy, serviços, portas, banco, variáveis, diretórios, backup, domínio, executores ou publicação exigem atualização do contrato correspondente no mesmo ciclo.

Todo PR ou release relevante deve declarar `Arquitetura: sem mudança` ou `Arquitetura: alterada`, indicando o arquivo de arquitetura atualizado. Se a arquitetura mudou e o contrato correspondente não foi atualizado, o trabalho não está completo.
