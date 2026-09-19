# Auditoria estrutural Intent — v1PC

Data: 2026-09-18. Escopo: main do repositório edinhogrubert/Intent. Documento de trabalho, não inventário completo nem autorização para mover/excluir arquivos.

## Regra aprovada

Uma única raiz de organização administrativa: `gestao/`. Código, configuração exigida por ferramentas, dependências, deploy e artefatos de execução ficam em seus locais técnicos. Não mover `src/`, `backend/` ou `deploy/` para gestão.

## Evidências examinadas

- `contratos/README.md`: descreve contratos, hierarquia de autoridade, executores e documentação de arquitetura.
- `contratos/INTERFACE_EXECUTORES.md`: interface de funções 1–15 e caminhos absolutos; exige atualização do contrato antes de acrescentar função.
- `scripts/executores/intent-executor-PC.sh`: executor PC atual, funções 1–15, função 8 executa checks, lint, builds e testes disponíveis.
- `scripts/executores/instalar-executor-PC.sh`: instalador usa URL fixa para `scripts/executores/intent-executor-PC.sh` e substitui o destino local após backup. Não mover sem revisão de dependências.
- `AGENTS.md`: instruções de retomada/pausa; verificar consumidores antes de mover.
- Árvore recursiva da main: identifica `.github/`, `contratos/`, `docs/`, `scripts/`, `Nova pasta/`, arquivos de projeto na raiz e diretórios técnicos. A lista da API foi truncada; cobertura integral ainda não comprovada.
- `Nova pasta/`: inclui scripts numerados e versões com sufixos como old, 1, 2, 3; nomes semelhantes não comprovam equivalência de conteúdo. Manter até comparação.

## Classificação inicial — propostas, não movimentações

| Origem | Natureza | Destino/ação proposta | Condição |
|---|---|---|---|
| `contratos/` | Governança operacional | `gestao/governanca/` e `gestao/operacao/` conforme conteúdo | Ler todos os arquivos e atualizar referências internas/externas antes de mover |
| `docs/ai-handoff/` | Comunicação e continuidade | `gestao/comunicacao/` | Verificar dependências e apontamentos existentes |
| Documentos de projeto na raiz (`projatual`, `projetocompleto`, `revisar` quando encontrados) | Requisitos/estado/histórico a classificar | `gestao/projeto/` ou `gestao/historico/` | Comparar conteúdos e verificar implementação; não escolher vigente pelo nome |
| `Nova pasta/` | Pacote heterogêneo de scripts e documentos | Classificar item a item; históricos em `gestao/historico/`, scripts operacionais em caminho técnico adequado | Conferir conteúdo, hash e chamadas antes de mover |
| `scripts/executores/` | Código operacional | Manter provisoriamente no caminho técnico atual | Instalador contém referência fixa; movimentação exige migração validada |
| `AGENTS.md`, `.github/`, arquivos de build/configuração na raiz | Arquivos com possível caminho obrigatório | Manter até prova de que mover não quebra ferramentas | Verificar consumidores |
| `src/`, `backend/`, `deploy/` | Implementação e implantação | Permanecem fora de `gestao/` | Não abrangidos pela migração administrativa |

## Próximas verificações obrigatórias

1. Obter inventário completo da árvore em commit fixo, com caminhos, tipos, hashes e tamanhos, sem truncamento.
2. Ler os documentos de governança, continuidade, requisitos e projeto, incluindo todos os candidatos a duplicidade.
3. Buscar referências de caminho em scripts, CI, documentação, imports e instaladores.
4. Montar matriz origem → destino → dependentes → classificação (vigente/histórico/duplicado comprovado) → risco → validação.
5. Propor movimentos em branch, preservar histórico Git e nunca apagar sem equivalência demonstrada e autorização.
6. Atualizar documentos e caminhos afetados no mesmo PR; executar verificações de sintaxe, links, testes pertinentes.

## Registro de mudanças desta etapa

Criado somente este relatório na branch `chore/auditoria-gestao-v1-20260918`. Nenhum arquivo preexistente alterado, movido ou excluído. Sem merge, deploy ou alteração na VM. Estado: auditoria iniciada; levantamento e comparação integral pendentes.
