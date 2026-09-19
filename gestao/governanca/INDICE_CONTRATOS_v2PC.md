# Índice de contratos — v2PC

**Escopo:** navegação da branch de reorganização `chore/auditoria-gestao-v1-20260918`. A `main` não recebeu esta reorganização.

## Fonte dos contratos

Os oito documentos originais foram transferidos para `gestao/governanca/contratos/`; alguns já receberam correções de caminhos e, portanto, seus blobs não são mais idênticos aos originais. Para leitura, utilize:

1. [Contrato do agente sênior](contratos/CONTRATO_AGENTE_SENIOR_CHATGPT.md)
2. [Interface dos executores](contratos/INTERFACE_EXECUTORES.md)
3. [Mapa de scripts operacionais](contratos/MAPA_SCRIPTS_OPERACIONAIS.md)
4. [Arquitetura atual do PC](contratos/ARQUITETURA_ATUAL_PC.md) ou [arquitetura atual da VM](contratos/ARQUITETURA_ATUAL_VM.md)
5. [Fluxo de funcionalidade](contratos/FLUXO_FUNCIONALIDADE.md)
6. [Agentes de laboratório e integração](contratos/CONTRATO_AGENTES_LABORATORIO_INTEGRACAO.md)
7. [Contrato de continuidade](../comunicacao/ai-handoff/continuidade/CONTRATO_CONTINUIDADE_INTENT.md)
8. [Estado atual registrado](../comunicacao/ai-handoff/continuidade/ESTADO_ATUAL_INTENT.md)

**Caminhos operacionais:** scripts executáveis permanecem em `scripts/executores/` na raiz do repositório; [acesse os executores](../../scripts/executores/). Os registros de arquitetura a manter são `gestao/governanca/contratos/ARQUITETURA_ATUAL_PC.md` e `gestao/governanca/contratos/ARQUITETURA_ATUAL_VM.md`. Mudança de localização não comprova atualização do estado técnico.

**Consistência e bloqueio:** a antiga pasta raiz `contratos/` já foi retirada desta branch, e o README transferido foi corrigido. Entretanto, a função 9 dos executores PC e VM ainda consulta `contratos/` e `docs/ai-handoff/continuidade/`, caminhos inexistentes nesta branch. A preparação de release do PC depende dessa função. Consulte [bloqueios dos executores](../auditoria/BLOQUEIOS_EXECUTORES_POS_MIGRACAO.md). A integração continua bloqueada até corrigir os consumidores e validar referências em todo o repositório. Não executar instaladores, fazer merge ou alterar PC/VM durante a reorganização.
