# Fluxo de Funcionalidade do Intent

Este contrato define como uma funcionalidade deve sair de uma ideia e chegar ao estado pronto, sem depender de comandos soltos.

## Objetivo

Evitar este tipo de fluxo quebrado:

```text
faz isso no PC
agora roda esse comando
agora vai na VM
agora volta aqui
agora roda git
agora testa
agora me manda outro comando
```

O usuário não deve ser obrigado a conduzir manualmente cada pedaço técnico.

O ChatGPT deve orquestrar o fluxo e, quando chegar a hora do PC ou da VM, pedir apenas a função correta do executor.

## Fluxo oficial

### 1. Pedido da funcionalidade

O usuário descreve a funcionalidade desejada.

O ChatGPT deve transformar isso em uma tarefa clara, com escopo, limites e resultado esperado.

### 2. Prompt para laboratório

O ChatGPT cria um prompt para o **Agente de Implementação de Laboratório**.

Esse prompt deve explicar:

- papel do agente;
- contexto do projeto;
- escopo exato;
- arquivos prováveis;
- regras de segurança;
- o que não pode alterar;
- testes esperados;
- formato do relatório final.

### 3. Retorno do laboratório

O usuário cola o relatório do laboratório.

O ChatGPT deve analisar o relatório e separar:

- o que foi implementado;
- o que foi testado;
- o que é proposta;
- o que é risco;
- o que pode ser integrado;
- o que precisa ser descartado ou adaptado.

### 4. Ação do ChatGPT no GitHub

Quando autorizado e quando a ferramenta permitir, o ChatGPT pode:

- criar branch;
- criar documentação;
- abrir PR;
- atualizar descrição de PR;
- integrar mudanças simples;
- revisar diffs;
- preparar handoff para outro agente.

O ChatGPT não deve afirmar que rodou testes locais se não rodou.

### 5. Integração oficial

Se o ChatGPT não puder finalizar tudo, ele deve preparar a tarefa para o **Agente de Integração Oficial**.

Esse agente recebe uma tarefa clara e deve devolver relatório.

### 6. Retorno da integração

O usuário cola o relatório do Agente de Integração Oficial.

O ChatGPT valida:

- branch;
- commit;
- PR;
- arquivos alterados;
- testes;
- pendências;
- se o escopo foi respeitado.

### 7. Execução das funções PC/VM

Depois da implementação/integração, o ChatGPT não deve mandar comandos soltos.

Ele deve pedir, por exemplo:

```text
Execute função PC(1,2,3,4,6,7,8,9,14)
```

ou, se houver deploy autorizado:

```text
Execute função VM(1,2,3,4,6,7,8,11,12,13,14)
```

Os números precisam existir no contrato `INTERFACE_EXECUTORES.md`.

### 8. Retorno dos executores

O usuário cola o relatório do executor.

O ChatGPT deve então dizer o estado final:

- PC atualizado ou não;
- GitHub atualizado ou não;
- release criada ou não;
- VM atualizada ou não;
- produção validada ou não;
- pendências reais;
- próxima ação segura.

### 9. Próxima funcionalidade

Somente depois do relatório final é que o ChatGPT deve liberar o próximo ciclo de funcionalidade.

## Frases padrão

### Para iniciar laboratório

```text
Segue o prompt para o Agente de Implementação de Laboratório.
Cole o relatório final aqui quando terminar.
```

### Depois da integração

```text
Funcionalidade concluída no nível de integração.
Execute função PC(...).
Cole aqui o relatório.
```

### Depois do PC

```text
Relatório PC recebido.
Estado local/Git confirmado.
Se autorizar deploy, execute função VM(...).
```

### Depois da VM

```text
Relatório VM recebido.
Estado de produção confirmado.
Funcionalidade fechada.
Podemos iniciar a próxima.
```

## O que não fazer

O ChatGPT não deve responder com:

```bash
cd ...
git pull
npm test
ssh ...
```

salvo se o usuário pedir explicitamente comandos manuais.

## Critério de pronto

Uma funcionalidade só está pronta quando seu estado estiver claro:

- pronta em laboratório;
- integrada oficialmente;
- mergeada ou não;
- validada no PC ou não;
- release criada ou não;
- deploy feito ou não;
- validada em produção ou não.

Não usar a palavra “pronto” sem dizer em qual nível.