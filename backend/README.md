# Intent API — fundação do MVP

Primeira fatia vertical do backend do Intent:

- identidade validada por Firebase Authentication;
- perfil persistido no PostgreSQL;
- criação de Intent do tipo `SUPPORT_REVEAL`;
- revelação cifrada com AES-256-GCM;
- apoio único por usuário;
- realização automática ao alcançar a meta;
- eventos de domínio append-only;
- feed público sem exposição antecipada da revelação.

## Limites desta fundação

Este incremento não conecta ainda o frontend à API e não implementa comentários, seguidores,
mensagens, notificações ou rankings. Esses módulos serão adicionados após a validação da fatia
vertical principal.

## Execução local

1. Copie `.env.example` para `.env` e preencha valores reais.
2. Execute `npm install`.
3. Execute `npm run prisma:generate`.
4. Execute `npm run db:migrate`.
5. Execute `npm run dev`.

Nunca armazene senha de usuário, token Firebase, chave de serviço ou chave de revelação no Git.
