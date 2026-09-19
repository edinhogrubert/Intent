# Resumo da integração oficial — Bloco 22

Base mvp-1.0.20 / a075ec5; entrega reaproveitada bb641a4 de intentNew.

Reaproveitadas consultas agregadas e seções visuais do laboratório. Adicionados filtros públicos/estado/autor ativo às métricas, preservando privacidade inclusive no próprio perfil. Participações realizadas contam Intents distintas com OR entre apoios, comentários e reações, sem somar interações duplicadas.

Mantidos contrato e controles oficiais do Bloco 21: seguir/deixar de seguir, listas paginadas, retry, isolamento de requisições, histórico e navegação. Novas seções: Conexões, Como criador, Como participante e Identidade Social no Intent. Texto evita atribuir atividade inexistente ao perfil sem atividade; métricas negativas e avaliação pública não são expostas.

app.ts e rotas não são necessários. Nenhuma mudança em Prisma, migrations, infraestrutura, dependências ou domínio. Quatro arquivos de código/testes alterados e quatro documentos criados. Ver validacoes.md para evidência e limites.
