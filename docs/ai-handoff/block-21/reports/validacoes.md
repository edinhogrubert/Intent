# Validações oficiais — Bloco 21

| Verificação | Resultado |
| --- | --- |
| main e origin/main antes da integração | 7ea9d7a, árvore limpa |
| tag mvp-1.0.19 local/remota | aponta para 7ea9d7a |
| git diff --check | aprovado |
| npm run lint | aprovado |
| npm run build | aprovado, 1706 módulos |
| npm --prefix backend run lint | aprovado |
| cd backend && npx --no-install prisma generate --schema=prisma/schema.prisma | aprovado, Prisma Client 6.19.0 |
| cd backend && npm test | 210 testes, 10 suítes aprovadas; social-http com 96 testes |
| Comparação schema laboratório/oficial | conteúdo idêntico |
| Arquivos Prisma, migrations e configuração oficial | sem alterações |

Prisma executado no backend para usar a dependência já instalada e versionada, com o mesmo schema solicitado. Nenhuma atualização de dependências ou operação de banco executada.

## Regressões cobertas

Perfil público e contadores ativos; próprio perfil; proteção de campos privados; autenticação; visitante suspenso; alvo inexistente/inativo sem mutação; follow/unfollow repetidos; uma única notificação; paginação followers/following e seleção pública. Suítes existentes de comentários, reações, notificações, reveal e regras de domínio continuam aprovadas.

## Verificação funcional do frontend

Executado `node /tmp/block21-ui-check.cjs` com Playwright/Chrome headless, componente real compilado via esbuild e respostas sintéticas isoladas fora do produto. A primeira tentativa foi impedida pelo sandbox do navegador; execução autorizada concluída com sucesso.

Aprovados: resposta ApiSocialProfile de follow sem substituir histórico público; unfollow; reversão após erro; botão Abrir Intent e Voltar; duas páginas de seguidores; Escape; erro de lista com retry; troca de perfil com requisição em andamento; ausência de ação de follow no próprio perfil; nenhum erro JavaScript.

Limitações: teste funcional não foi homologação visual nem login real. PostgreSQL/VM não acessados. Nenhuma migration, seed, reset, deploy ou comando destrutivo executado.
