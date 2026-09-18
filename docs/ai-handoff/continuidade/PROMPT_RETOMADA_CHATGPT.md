# Prompt de Retomada — ChatGPT

Retome o projeto Intent usando este pacote como fonte de verdade.

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

## Estado resumido atual

- Projeto: Intent
- Oficial: `edinhogrubert/Intent`
- Branch oficial: `main`
- PR atual: `#26`
- Branch do PR: `feat/shareable-links`
- Último commit de código conhecido com bloqueio: `a02beb970e42eddd8b44edff0960f24ea87d857e`
- Bloco atual: 25
- Conteúdo do PR: 25A + 25B + 25C
- Estado: BLOQUEADO
- Motivo: race condition no 25C em `PublicUserActivity.tsx`, onde resposta pendente de “Carregar mais” pode ser aplicada após troca de filtro.
- Não fazer merge.
- Não criar release.
- Não fazer deploy.
- Próxima ação: corrigir isolamento de requisições/cursor/lista no filtro de atividade pública.

## Frase de abertura recomendada no novo chat

“Retome o projeto Intent. Use os arquivos de continuidade em `docs/ai-handoff/continuidade/` como fonte de verdade. Primeiro me diga o estado confirmado, o bloqueio atual e o próximo passo seguro.”
