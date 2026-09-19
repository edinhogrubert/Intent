# Índice de contratos — v2PC

**Escopo:** navegação da branch de reorganização `chore/auditoria-gestao-v1-20260918`. A `main` não recebeu esta reorganização.

## Fonte dos contratos

Os oito documentos originais foram transferidos para `gestao/governanca/contratos/`; alguns receberam correções de caminhos e seus blobs, por isso, não são mais idênticos aos originais. Para leitura, utilize:

1. [Contrato do agente sênior](contratos/CONTRATO_AGENTE_SENIOR_CHATGPT.md)
2. [Interface dos executores](contratos/INTERFACE_EXECUTORES.md)
3. [Mapa de scripts operacionais](contratos/MAPA_SCRIPTS_OPERACIONAIS.md)
4. [Arquitetura atual do PC](contratos/ARQUITETURA_ATUAL_PC.md) ou [arquitetura atual da VM](contratos/ARQUITETURA_ATUAL_VM.md)
5. [Fluxo de funcionalidade](contratos/FLUXO_FUNCIONALIDADE.md)
6. [Agentes de laboratório e integração](contratos/CONTRATO_AGENTES_LABORATORIO_INTEGRACAO.md)
7. [Contrato de continuidade](../comunicacao/ai-handoff/continuidade/CONTRATO_CONTINUIDADE_INTENT.md)
8. [Estado atual registrado](../comunicacao/ai-handoff/continuidade/ESTADO_ATUAL_INTENT.md)

**Caminhos operacionais:** scripts executáveis permanecem em `scripts/executores/` na raiz do repositório; [acesse os executores](../../scripts/executores/). Os registros de arquitetura a manter são `gestao/governanca/contratos/ARQUITETURA_ATUAL_PC.md` e `gestao/governanca/contratos/ARQUITETURA_ATUAL_VM.md`. Mudança de localização não comprova atualização do estado técnico.

**Consistência e bloqueio:** a antiga pasta raiz `contratos/` foi retirada desta branch. O commit `014ab9b3860319f831eab0af0daf696a54133f5f` corrigiu os caminhos consultados pela função 9 de ambos os executores; o commit `3978aebd34c02a640d03b8ceaf890f93360e756a` corrigiu a descrição da função 6 no README. Essas correções não foram instaladas nos ambientes PC/VM. Consulte [auditoria dos executores](../auditoria/BLOQUEIOS_EXECUTORES_POS_MIGRACAO.md): a validação de sintaxe e o resultado dos checks automatizados devem ser confirmados, assim como os consumidores e links de todo o repositório. A integração continua bloqueada até concluir a auditoria. Não executar instaladores, fazer merge ou alterar PC/VM durante esta reorganização.
