# Contratos Operacionais do Projeto Intent

Esta pasta guarda os contratos humanos do projeto Intent.

Eles existem para impedir que o trabalho dependa de memória solta, improviso, comandos avulsos ou interpretação automática de uma conversa fora de contexto.

## Ideia principal

O Intent passa a trabalhar com papéis claros:

- **Agente Senior / ChatGPT**: orquestra, revisa, decide o próximo passo e protege o processo.
- **Agente de Implementação de Laboratório**: implementa e testa fora da linha oficial.
- **Agente de Integração Oficial**: integra de forma cirúrgica no repositório oficial.
- **Executores PC/VM**: executam rotinas locais e de produção por funções numeradas.

Cada agente tem deveres, limites e uma forma correta de entregar resultado.

## Regra humana

Antes de automatizar, o processo precisa ser compreensível por uma pessoa.

Por isso, estes contratos devem ser escritos como instruções claras, não como código disfarçado. Código vem depois.

## Arquivos desta pasta

- `CONTRATO_AGENTE_SENIOR_CHATGPT.md`
  - Regras do ChatGPT como agente senior e orquestrador.

- `INTERFACE_EXECUTORES.md`
  - Contrato numérico único dos executores do PC e da VM, como uma interface Java.

- `FLUXO_FUNCIONALIDADE.md`
  - Fluxo oficial para criar uma funcionalidade sem comandos soltos.

- `CONTRATO_AGENTES_LABORATORIO_INTEGRACAO.md`
  - Regras dos agentes de laboratório e integração oficial.

- `ARQUITETURA_ATUAL_VM.md`
  - Registro da arquitetura atual da VM, configuração operacional e regra obrigatória para manter o ambiente recriável.

- `ARQUITETURA_ATUAL_PC.md`
  - Registro da estação local de desenvolvimento e integração, incluindo bootstrap seguro em outro PC sem copiar segredos ou o ambiente da VM.

- `MAPA_SCRIPTS_OPERACIONAIS.md`
  - Registro dos scripts auxiliares existentes e da função numerada que deve chamá-los.

## Scripts de execução

Os executores e instaladores ficam em:

```text
scripts/executores/
```

Arquivos principais:

- `scripts/executores/intent-executor-PC.sh`
- `scripts/executores/intent-executor-VM.sh`
- `scripts/executores/instalar-executor-PC.sh`
- `scripts/executores/instalar-executor-VM.sh`

Esses arquivos implementam a interface documentada, mas a regra humana continua valendo: o usuário chama função numerada; agentes não devem mandar comandos auxiliares soltos.

## Ordem de autoridade

Quando houver dúvida, a ordem de leitura é:

1. `CONTRATO_AGENTE_SENIOR_CHATGPT.md`
2. `INTERFACE_EXECUTORES.md`
3. `MAPA_SCRIPTS_OPERACIONAIS.md`
4. `ARQUITETURA_ATUAL_PC.md` para trabalho local, ou `ARQUITETURA_ATUAL_VM.md` para VM/deploy
5. `FLUXO_FUNCIONALIDADE.md`
6. `CONTRATO_AGENTES_LABORATORIO_INTEGRACAO.md`
7. `docs/ai-handoff/continuidade/CONTRATO_CONTINUIDADE_INTENT.md`
8. `docs/ai-handoff/continuidade/ESTADO_ATUAL_INTENT.md`

A conversa atual não deve sobrescrever esses contratos sem confirmação explícita do usuário.

## Regra contra comandos soltos

Se existir executor para uma tarefa, o ChatGPT não deve mandar comandos como:

```bash
cd ...
git ...
npm ...
ssh ...
```

O formato correto é:

```text
Execute função PC(...)
```

ou:

```text
Execute função VM(...)
```

O usuário executa a função, cola o relatório, e o próximo passo é decidido a partir do relatório.

## Regra de arquitetura recriável

A arquitetura operacional precisa estar sempre documentada em:

```text
contratos/ARQUITETURA_ATUAL_PC.md
contratos/ARQUITETURA_ATUAL_VM.md
```

Atualize o contrato correspondente sempre que houver mudança significativa de ferramentas locais, infraestrutura, deploy, serviços, portas, banco, variáveis, diretórios, backup, domínio, executores ou forma de publicação.

Todo PR ou release relevante deve declarar um destes estados:

```text
Arquitetura: sem mudança
```

ou:

```text
Arquitetura: alterada
Arquivo atualizado: contratos/ARQUITETURA_ATUAL_PC.md e/ou contratos/ARQUITETURA_ATUAL_VM.md
```

Se a arquitetura mudou e o contrato de arquitetura não foi atualizado, o trabalho não está completo.
