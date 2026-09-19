# Gestão do Intent — estrutura canônica proposta (v1PC)

Este arquivo é o ponto de entrada da **reorganização em branch**, não substitui contratos vigentes na `main` até migração e validação concluídas.

## Fronteira de responsabilidade

`gestao/` concentra governança, documentação de produto, registros de arquitetura, comunicação entre agentes, continuidade, auditorias e histórico administrativo. Não é destino para código de aplicação, bibliotecas, migrations, CI, configuração de ferramentas, deploy nem executáveis que façam parte da operação técnica. A raiz pode manter arquivos exigidos por ferramentas, como `AGENTS.md`, `package.json` e `.github/`; seu conteúdo de gestão deve apontar para `gestao/` quando a compatibilidade for comprovada.

## Organização interna

- `gestao/governanca/`: contratos, autoridade, papéis, processos e políticas de mudança.
- `gestao/projeto/`: visão, requisitos, backlog e roadmap, com estado verificado em vez de reproduzir status antigos.
- `gestao/arquitetura/`: documentação recriável de PC, VM e arquitetura lógica, separada do código e de `deploy/`.
- `gestao/operacao/`: manuais, mapa de scripts, procedimentos e referências a executáveis que continuam no local técnico apropriado.
- `gestao/comunicacao/`: protocolo de handoff, continuidade e relatórios por bloco.
- `gestao/historico/`: documentos superados, versões preservadas e pacotes antigos classificados; não é área de execução.
- `gestao/auditoria/`: inventário, matriz de dependências, decisão por arquivo, provas de validação e registro de migração.

## Política de fonte vigente

1. Fixar commit-base da `main` antes da comparação.
2. Classificar cada arquivo e diretório pelo conteúdo e por seus consumidores, nunca apenas pelo nome.
3. Identificar documentos com finalidade sobreposta, comparar o conteúdo e confrontar afirmações de estado com código, testes e commits; o mais recente não é automaticamente o correto.
4. Manter uma fonte vigente por assunto e preservar a proveniência do material histórico. SHA igual prova duplicata exata; nomes semelhantes não provam.
5. Ao mover arquivos, recriar ou atualizar todos os caminhos em links, CI, scripts e contratos na mesma alteração; validar a resolução das referências.
6. Não mover `src/`, `backend/`, `deploy/`, configurações de execução e outros componentes técnicos apenas para cumprir a raiz única de gestão.
7. Não excluir originais nem atualizar `main` sem comparação e revisão da migração. Nunca executar scripts ou realizar deploy para reorganizar documentação.

## Itens de classificação confirmada

- `contratos/README.md` define autoridade e referencia contratos, executores e continuidade: conteúdo administrativo candidato a `gestao/governanca/`, com atualização coordenada de referências.
- `AGENTS.md` contém comandos especiais de agente: conteúdo de governança, mas localização na raiz exige compatibilidade verificada antes de qualquer alteração.
- `JIRA.md` contém backlog e status de protótipo: candidato a `gestao/projeto/`; status devem ser revalidados contra o estado do código antes de marcá-los vigentes.
- `Nova pasta/` contém scripts e documentos de natureza mista: classificação item a item, sem movimentação em bloco.
- `scripts/executores/` contém executáveis com referências de caminho no instalador PC: preservar execução técnica e migrar apenas se todas as chamadas forem recriadas e validadas.

## Referências de auditoria

- `gestao/auditoria/AUDITORIA_ESTRUTURA_v1PC.md`
- `gestao/auditoria/MATRIZ_DEPENDENCIAS_v1PC.md`

A criação desta estrutura não significa que o inventário integral, a consolidação documental ou a migração estejam concluídos. O aceite requer inventário completo, matriz de origem/destino, verificação de referências e revisão do diff final.
