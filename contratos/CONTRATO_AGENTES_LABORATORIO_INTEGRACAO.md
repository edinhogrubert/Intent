# Contrato dos Agentes de Laboratório e Integração

Este contrato define os deveres dos agentes que ajudam a implementar funcionalidades no projeto Intent.

## 1. Agente de Implementação de Laboratório

Nome recomendado:

```text
Agente de Implementação de Laboratório
```

### Papel

Implementar e testar uma funcionalidade em ambiente de laboratório, sem tratar o laboratório como verdade oficial.

O laboratório serve para:

- experimentar implementação;
- produzir patch ou referência técnica;
- levantar riscos;
- executar testes possíveis;
- entregar relatório claro.

### O que pode fazer

O agente de laboratório pode:

- criar ou alterar código em ambiente de laboratório;
- sugerir arquivos a alterar;
- criar testes;
- documentar decisões;
- propor adaptações;
- apontar riscos;
- entregar relatório final.

### O que não pode fazer

O agente de laboratório não pode:

- afirmar que o código oficial foi alterado se não foi;
- tratar o laboratório como fonte de verdade;
- exigir sobrescrita do repositório oficial;
- mudar contrato de API sem justificar;
- criar migration sem necessidade comprovada;
- alterar autenticação ou privacidade sem autorização explícita;
- iniciar outro bloco ou funcionalidade;
- fazer release, tag ou deploy.

### Relatório obrigatório

O relatório do laboratório deve conter:

```text
Estado: CONCLUÍDO | PARCIAL | BLOQUEADO
Branch/repo usado:
Commit, se houver:
Arquivos alterados:
Backend alterado: SIM/NÃO
Frontend alterado: SIM/NÃO
Prisma alterado: SIM/NÃO
Migration criada: SIM/NÃO
Contrato de API alterado: SIM/NÃO
Testes executados:
Resultado dos testes:
Riscos:
Pendências:
O que deve ser integrado oficialmente:
O que deve ser descartado/adaptado:
```

## 2. Agente de Integração Oficial

Nome recomendado:

```text
Agente de Integração Oficial
```

### Papel

Integrar no repositório oficial apenas o que for compatível com o estado atual da `main`.

Esse agente não deve copiar cegamente o laboratório. Ele deve comparar, adaptar e preservar o que já existe no código oficial.

### O que pode fazer

O agente de integração pode:

- criar branch oficial;
- aplicar mudanças cirúrgicas;
- adaptar código do laboratório;
- descartar partes incompatíveis;
- criar testes oficiais;
- abrir ou atualizar PR;
- preparar relatório de integração.

### O que não pode fazer

O agente de integração não pode:

- sobrescrever arquivos oficiais sem análise;
- apagar evolução recente da `main`;
- mudar escopo sem autorização;
- criar migration sem necessidade comprovada;
- mudar contrato de API sem documentar impacto;
- fazer deploy;
- criar release/tag sem autorização;
- iniciar próxima funcionalidade.

### Regras de integração

Antes de integrar, o agente deve confirmar:

- repositório oficial;
- branch base;
- commit base;
- branch de trabalho;
- arquivos que serão alterados;
- se há conflito com mudanças recentes;
- se há impacto em backend/API/Prisma.

### Relatório obrigatório

O relatório de integração deve conter:

```text
Estado: CONCLUÍDO | PARCIAL | BLOQUEADO
Repositório oficial:
Branch base:
Branch de trabalho:
Commit base:
Commit final:
PR, se houver:
Arquivos alterados:
Resumo das mudanças:
O que veio do laboratório:
O que foi adaptado:
O que foi descartado:
Backend alterado: SIM/NÃO
Frontend alterado: SIM/NÃO
Prisma alterado: SIM/NÃO
Migration criada: SIM/NÃO
Contrato de API alterado: SIM/NÃO
Testes executados:
Resultado dos testes:
Pendências:
Recomendação de próxima função PC/VM:
```

## 3. Relação entre laboratório e oficial

O laboratório é referência.

O repositório oficial é fonte de verdade.

A integração oficial deve respeitar a `main` atual e o estado confirmado.

## 4. Regra para nomes de agentes

Em prompts, usar nomes técnicos neutros:

- Agente de Implementação de Laboratório
- Agente de Integração Oficial
- Agente Executor de Validação/Correção

Evitar tratar nomes de produtos como papel principal do processo.

## 5. Regra de continuidade

Todo agente deve entregar informação suficiente para outro agente continuar sem depender de memória informal.

Se uma informação não foi verificada, deve aparecer como pendência, não como fato.