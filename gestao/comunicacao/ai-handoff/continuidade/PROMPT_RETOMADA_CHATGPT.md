# Prompt de Retomada — ChatGPT

Retome o projeto Intent usando este pacote como referência documental, **não como comprovação automática do estado atual**. Antes de declarar o estado oficial, consulte a branch, o commit, os PRs e os registros operacionais vigentes.

## Regras obrigatórias

1. Primeiro leia o `CONTRATO_CONTINUIDADE_INTENT.md`.
2. Depois leia o `ESTADO_ATUAL_INTENT.md`.
3. Separe sempre:
   - estado confirmado;
   - proposta;
   - histórico;
   - pendência;
   - bloqueio.
4. Não trate histórico como estado vigente.
5. Não assuma merge, release, deploy, tag ou alteração de VM sem confirmação explícita.
6. Não faça ações destrutivas sem autorização.
7. Preserve os contratos técnicos já definidos:
   - laboratório não altera oficial;
   - integração oficial é cirúrgica;
   - código de laboratório é referência, não ordem de sobrescrita;
   - backend/API/Prisma/migration só mudam com necessidade comprovada;
   - privacidade, autorização e autenticação não podem regredir.
8. Antes de sugerir próximo passo, informe:
   - bloco atual;
   - PR atual;
   - commit atual;
   - bloqueios;
   - próxima ação segura.
   Se não houver verificação atual, marque cada item como não confirmado.

## Registro histórico — snapshot do bloco 25 (não é estado vigente verificado)

Os dados abaixo foram preservados do documento anterior à reorganização. Não reutilize seus campos como estado oficial atual sem consulta independente.

- Projeto: Intent
- Oficial: `edinhogrubert/Intent`
- Branch oficial registrada: `main`
- PR então registrado: `#26`
- Branch do PR então registrada: `feat/shareable-links`
- Último commit de código então conhecido com bloqueio: `a02beb970e42eddd8b44edff0960f24ea87d857e`
- Bloco então registrado: 25
- Conteúdo então registrado do PR: 25A + 25B + 25C
- Estado à época: BLOQUEADO
- Motivo registrado: race condition no 25C em `PublicUserActivity.tsx`, onde resposta pendente de “Carregar mais” pode ser aplicada após troca de filtro.
- Restrições à época: não fazer merge, criar release ou fazer deploy.
- Próxima ação então registrada: corrigir isolamento de requisições/cursor/lista no filtro de atividade pública.

## Frase de abertura recomendada no novo chat

“Retome o projeto Intent. Use os arquivos de continuidade em `gestao/comunicacao/ai-handoff/continuidade/` como referência histórica e contratual. Verifique o estado vigente no repositório e nos registros operacionais antes de informar o bloqueio atual e o próximo passo seguro.”
