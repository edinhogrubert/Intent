# Bloco 16 — Navegação contextual por notificações

Base oficial: mvp-1.0.14, merge 4fb31c3.
Origem: trechos do laboratório fornecidos pelo usuário nesta integração,
referentes a f2c55d2 e às correções relatadas em 51d7c47. Esses commits não
estavam disponíveis no remoto; esta entrega reaplica os trechos fornecidos.

Notificações com intent.id abrem o detalhe correspondente via onSelectIntent
e fecham o modal. Sem Intent, não há ação de navegação. Clique, Enter e Espaço
ativam o item. O botão de leitura individual interrompe a propagação de clique
e teclado, sem abrir o detalhe.

Antes de navegar, uma notificação não lida solicita a marcação pela API real.
O contador só diminui após sucesso. Se a API falhar, a navegação continua,
mas a notificação permanece não lida e o contador não é decrementado.

Escopo: App.tsx, NotificationsModal.tsx e este handoff. Nenhum contrato de API,
backend, Prisma, migration ou mock foi alterado.

Validação local: git diff --check, npm run lint e npm run build.
Sem teste live, testes backend/PostgreSQL, push, PR, merge ou deploy.
