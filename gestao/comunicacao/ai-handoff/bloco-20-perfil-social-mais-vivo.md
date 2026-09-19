# Bloco 20 — Perfil Social Mais Vivo

Estado: IMPLEMENTADO NA INTEGRAÇÃO OFICIAL
Base: mvp-1.0.18 / 25e688a
Bloco: 20 — Perfil Social Mais Vivo
Frontend alterado: SIM
Backend alterado: NÃO
Prisma alterado: NÃO
Migration criada: NÃO
Mock alterado: NÃO
Contrato da API alterado: NÃO
Arquivo backend/src/lib/prisma.ts do laboratório: NÃO APLICADO

## Origem e escopo

Código reaproveitado de `edinhogrubert/intentNew`, commit `9616376`.
Integrados apenas `src/components/PublicUserProfile.tsx` e os quatro documentos deste bloco.
O contrato autenticado `GET /v1/users/:id/profile` já fornece os campos utilizados. O backend filtra Intents públicas com status PUBLISHED/REALIZED; o histórico mantém o limite existente de 20 registros.

## Funcionalidades integradas

Cabeçalho com identidade visual, selo de perfil público, avatar com fallback, nome, handle, membro desde e bio opcional; frase social; cinco cards de estatísticas; resumo em linguagem natural; chips de taxa de realização e média de apoios; histórico com status, apoios e botão Abrir Intent; carregamento, erro com nova tentativa, estado vazio, responsividade e semântica HTML.

## Ajustes na integração

A nova tentativa de carregamento passa pelo efeito React, com limpeza também na troca de usuário e desmontagem, impedindo atualização por respostas obsoletas.
O texto de apoios descreve apoios recebidos, sem afirmar que são pessoas únicas. Nomes longos podem quebrar linha no cabeçalho.

## Justificativa sobre prisma.ts

A entrega adiciona construção de DATABASE_URL com SQL_USER/SQL_ADMIN_USER, SQL_PASSWORD/SQL_ADMIN_PASSWORD, SQL_HOST e socket Cloud SQL, além de URL padrão de desenvolvimento. Classificação: adaptação específica do AI Studio/Cloud SQL, desnecessária ao Bloco 20 e com risco de substituir configuração da VM por fallback inadequado. Não é correção necessária ao projeto oficial. Arquivo oficial mantido intacto; demais adaptações de servidor, configuração, Firebase e dependências do laboratório também excluídas.

## Testes executados e resultados

TypeScript e build aprovados. Prisma Client 6.19.0 gerado pelo backend. Backend: 192 testes aprovados em 10 suítes. `git diff --check` aprovado. Detalhes e ajuste do comando Prisma em `block-20/reports/validacoes.md`.

## Pendências

Homologação visual autenticada em desktop/mobile não executada. Nenhum push, PR, merge ou deploy realizado.

## Veredito

Integração local concluída com validações automatizadas aprovadas, sem alterações de backend, domínio ou dados privados.
