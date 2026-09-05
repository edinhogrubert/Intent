# Intent — Estado das Funcionalidades e Próximos Passos

> **Objetivo:** oferecer uma visão simples e confiável do que já funciona, do que está sendo validado e do que ainda será desenvolvido.  
> **Última atualização:** 05 de setembro de 2026  
> **Versão implantada na Oracle:** `a859de7bdcd5633233597120ec19b3f49f80da56`  
> **Branch de desenvolvimento:** `codex/mvp-backend-base`  
> **Pull Request:** `#2` para a `main`

## Como interpretar este documento

| Estado | Significado |
|---|---|
| ✅ Implantado e validado | Está no GitHub, implantado na Oracle e passou pelos testes registrados |
| 🧪 Implantado, falta validação humana | Está tecnicamente ativo, mas o fluxo completo ainda precisa ser testado por usuários |
| 🟡 Próxima prioridade | Deve ser uma das próximas entregas do MVP |
| ⏳ Planejado | Faz parte do produto, mas ainda não será implementado |
| 🚫 Fora do MVP atual | Foi conscientemente adiado para evitar complexidade prematura |

## Regra de manutenção

Este arquivo deve ser atualizado sempre que uma funcionalidade:

1. for adicionada ao GitHub;
2. for implantada na VM Oracle;
3. passar ou falhar nos testes;
4. mudar de prioridade ou escopo;
5. for retirada do MVP.

Uma funcionalidade só muda para **✅ Implantado e validado** quando o código ativo no servidor corresponder ao commit registrado e os testes técnicos e funcionais tiverem sido concluídos.

---

# 1. Estado atual do MVP

## 1.1 Infraestrutura e implantação

| Funcionalidade | Estado | Observação |
|---|---|---|
| VM Oracle Cloud ARM64 | ✅ Implantado e validado | Ubuntu 24.04, 2 OCPUs, 12 GB RAM e disco de 50 GB |
| Docker e Docker Compose | ✅ Implantado e validado | Backend, frontend, PostgreSQL e Redis em contêineres |
| PostgreSQL 16 | ✅ Implantado e validado | Persistência real; porta não exposta publicamente |
| Redis 7 | ✅ Implantado e validado | Provisionado e saudável; uso funcional avançado ainda será definido |
| Backup local do PostgreSQL | ✅ Implantado e validado | Diário às 03:15, retenção de 7 dias |
| Repositório GitHub na VM | ✅ Implantado e validado | Deploy Key somente leitura |
| Implantação por commit exato | ✅ Implantado e validado | Scripts interrompem quando a branch não corresponde ao commit aprovado |
| Rollback de imagens Docker | ✅ Implantado e validado | Imagens anteriores são preservadas nas implantações recentes |
| Health checks | ✅ Implantado e validado | API, frontend, PostgreSQL e Redis |
| Portas da aplicação privadas | ✅ Implantado e validado | Frontend em `127.0.0.1:3000` e API em `127.0.0.1:8080` |
| Acesso por túnel SSH | ✅ Implantado e validado | Nenhuma porta pública da aplicação nesta etapa |
| HTTPS e domínio público | ⏳ Planejado | Será realizado somente quando houver decisão de publicação externa |
| Backup externo no Object Storage | ⏳ Planejado | Banco possui apenas backup local neste momento |
| Monitoramento e alertas externos | ⏳ Planejado | Ainda não configurados |

## 1.2 Autenticação e conta

| Funcionalidade | Estado | Observação |
|---|---|---|
| Firebase Authentication | ✅ Implantado e validado | Projeto ativo: `intent-86155` |
| Login com Google | ✅ Implantado e validado | Cancelamento do popup devolve o controle à tela de login |
| Login com e-mail e senha | ✅ Implantado e validado | Continua disponível após cancelamento do Google |
| Validação do token no backend | ✅ Implantado e validado | Rotas protegidas usam a identidade confirmada pelo Firebase |
| Perfil interno no PostgreSQL | ✅ Implantado e validado | Usuário Firebase é sincronizado com a conta do Intent |
| Nome de usuário simples | ✅ Implantado e validado | Padrão `@nome_sobrenome`; colisões recebem número incremental |
| CORS para túneis locais | ✅ Implantado e validado | `localhost:3000` e `localhost:3100` preservados |
| Cabeçalho compatível com popup OAuth | ✅ Implantado e validado | `same-origin-allow-popups` |
| Recuperação de senha | 🟡 Próxima prioridade | O Firebase suporta, mas o fluxo amigável ainda precisa ser integrado |
| Verificação de e-mail | ⏳ Planejado | Avaliar depois do fluxo principal estar estável |
| MFA, telefone, SMS, SAML e OIDC | 🚫 Fora do MVP atual | Complexidade e custo desnecessários neste momento |

## 1.3 Telas ativas do MVP limpo

| Tela | Estado | Fonte dos dados |
|---|---|---|
| Login e cadastro | ✅ Implantado e validado | Firebase Authentication |
| Início | ✅ Implantado e validado | API e PostgreSQL |
| Criar Intent | ✅ Implantado e validado | API e PostgreSQL |
| Minhas Intents | ✅ Implantado e validado | API e PostgreSQL |
| Detalhe da Intent | ✅ Implantado e validado | API e PostgreSQL |
| Perfil próprio e perfil social | ✅ Implantado e validado | API e PostgreSQL |
| Lista de seguidores | ✅ Implantado e validado | API e PostgreSQL |
| Lista de pessoas seguidas | ✅ Implantado e validado | API e PostgreSQL |
| Feed “Para você” | ✅ Implantado e validado | Somente Intents públicas reais |
| Feed “Seguindo” | 🧪 Implantado, falta validação humana | Código e segurança validados; falta teste completo com contas diferentes |
| Telas antigas com dados fictícios | ✅ Removidas do fluxo ativo | Não fazem parte da navegação nem do bundle ativo |

## 1.4 Intents e revelação

| Funcionalidade | Estado | Observação |
|---|---|---|
| Criar Intent por meta de apoios | ✅ Implantado e validado | Meta aceita quantidade exata, sem incremento obrigatório de 5 |
| Categorias essenciais | ✅ Implantado e validado | Inclui Esportes e outras categorias do MVP |
| Persistência real | ✅ Implantado e validado | Intents gravadas no PostgreSQL |
| Conteúdo de revelação protegido | ✅ Implantado e validado | Texto cifrado no backend com AES-256-GCM |
| Apoio único por usuário | ✅ Implantado e validado | Restrição no banco |
| Apoiar e retirar apoio | ✅ Implantado e validado | Primeiro clique apoia; segundo clique retira |
| Bloqueio de retirada após realização | ✅ Implantado e validado | Histórico permanece consistente após revelar |
| Realização automática ao atingir a meta | ✅ Implantado e validado | Condição avaliada pelo backend |
| Revelação após a realização | ✅ Implantado e validado | Conteúdo somente é aberto depois da condição |
| Histórico de eventos essenciais | ✅ Implantado e validado | Criação, apoio, retirada e realização registrados |
| Visibilidade pública | ✅ Implantado e validado | Aparece no feed geral |
| Visibilidade para seguidores | 🧪 Implantado, falta validação humana | Backend verifica o vínculo real antes de permitir acesso |
| Visibilidade privada completa | ⏳ Planejado | Regras de destinatários ainda não fazem parte do MVP limpo |
| Condição por data | 🟡 Próxima prioridade | Deve impedir datas retroativas e respeitar timezone |
| Condição por aprovadores/guardiões | 🟡 Próxima prioridade | Exigirá escolha explícita dos aprovadores e regra N de M |
| Palpite protegido | ⏳ Planejado | Encerramento e responsável pela revelação precisam ser definidos |
| Arquivos, imagens e links protegidos | ⏳ Planejado | O MVP ativo protege texto; mídia dependerá de Object Storage |
| Condições combinadas | 🚫 Fora do MVP atual | Fase posterior do motor de regras |

## 1.5 Base social real

| Funcionalidade | Estado | Observação |
|---|---|---|
| Seguir perfil | ✅ Implantado e validado | Contador real |
| Deixar de seguir | ✅ Implantado e validado | Ação explícita e reversível |
| Voltar a seguir | ✅ Implantado e validado | Testado com atualização correta do contador |
| Seguidores e seguindo | ✅ Implantado e validado | Listas reais, contas inativas ocultadas |
| Paginação das conexões | ✅ Implantado e validado | 20 pessoas por página |
| Perfil público | ✅ Implantado e validado | Dados reais do PostgreSQL |
| Intents criadas e realizadas | ✅ Implantado e validado | Métricas reais |
| Apoios dados e recebidos | ✅ Implantado e validado | Métricas reais |
| Taxa de realização | ✅ Implantado e validado | Percentual simples e explicável |
| Feed de pessoas seguidas | 🧪 Implantado, falta validação humana | Inclui Intents públicas e exclusivas para seguidores |
| Confiabilidade | ⏳ Planejado | Não será exibida com nota artificial |
| Mobilização por pessoas únicas | ⏳ Planejado | Fórmula ainda precisa ser especificada e versionada |
| Frequência e participação histórica | ⏳ Planejado | Métricas futuras |
| Níveis e reconhecimento | ⏳ Planejado | Não devem confundir popularidade com confiança |

## 1.6 Segurança e integridade

| Controle | Estado | Observação |
|---|---|---|
| Segredos fora do Git | ✅ Implantado e validado | Configuração protegida na VM |
| Banco e Redis sem exposição pública | ✅ Implantado e validado | Somente redes Docker internas |
| API e frontend restritos ao localhost | ✅ Implantado e validado | Acesso atual por túnel SSH |
| Firewall com entrada negada por padrão | ✅ Implantado e validado | SSH restrito à faixa autorizada |
| Validação de entrada com schema | ✅ Implantado e validado | Zod no backend |
| Contadores controlados pelo backend | ✅ Implantado e validado | Frontend não define quantidade de apoios |
| Transações nas ações críticas | ✅ Implantado e validado | Apoio, retirada, realização e eventos |
| Eventos com chave de idempotência | ✅ Implantado e validado | Eventos essenciais evitam duplicação |
| Logs estruturados | ✅ Implantado e validado | API com identificação de requisição |
| Rate limiting | 🟡 Próxima prioridade | Necessário antes da abertura pública |
| Auditoria de restauração de backup | ⏳ Planejado | Backup é criado; restauração periódica ainda deve ser ensaiada |
| Varredura automatizada de vulnerabilidades | ⏳ Planejado | Antes da exposição pública |

---

# 2. Validações já realizadas

- Build TypeScript e build de produção aprovados nas implantações anteriores.
- Login com Google e e-mail/senha testados.
- Cancelamento do popup Google testado.
- Criação e realização de Intents testadas com três usuários.
- Apoio, retirada e novo apoio testados.
- Fluxos anteriores com um e dois aprovadores foram experimentados no protótipo, mas **a aprovação ainda não pertence ao MVP limpo ativo**.
- Seguir, deixar de seguir e voltar a seguir testados.
- Listas de seguidores e seguindo testadas.
- Verificação técnica do commit `a859de7`: 26 verificações aprovadas e nenhuma falha.
- PostgreSQL, Redis, API, frontend, Firebase, CORS, portas e backup validados.

## Validação humana ainda pendente

Executar com pelo menos três contas:

1. A conta A cria uma Intent com visibilidade **Seguidores**.
2. A conta B segue a conta A e deve visualizar a Intent na aba **Seguindo**.
3. A conta C não segue a conta A e não deve visualizar nem abrir a Intent.
4. A conta B deixa de seguir a conta A e perde o acesso à Intent exclusiva.
5. A Intent pública da conta A continua visível para B e C no feed geral.

---

# 3. Próximas prioridades recomendadas

## Prioridade 1 — concluir a fatia social básica

### 1. Testar completamente o feed “Seguindo”

Critério de conclusão: todos os cinco passos da validação humana acima aprovados.

### 2. Curtidas e comentários reais

- curtir e descurtir;
- uma curtida por usuário;
- comentários persistidos;
- excluir o próprio comentário conforme política;
- contadores derivados de registros reais;
- comentários e curtidas não alteram a condição de apoio;
- registrar eventos importantes;
- apresentar estado vazio sem conteúdo fictício.

### 3. Recuperação de senha

- usar o fluxo do Firebase;
- informar resultado sem revelar se determinado e-mail existe;
- manter Google e e-mail/senha disponíveis.

## Prioridade 2 — fortalecer o ciclo da Intent

### 4. Condição por data

- data futura obrigatória;
- timezone explícito;
- rejeitar datas retroativas no frontend e no backend;
- job confiável para avaliar vencimentos;
- testes de horário e mudança de dia.

### 5. Aprovação por pessoas

- criador escolhe pessoas reais como aprovadores;
- separar aprovador de destinatário;
- regra clara: unanimidade ou N de M;
- zero aprovadores invalida a configuração;
- aprovação única por usuário e versão;
- histórico e autorização no backend.

### 6. Notificações internas essenciais

- novo seguidor;
- apoio recebido ou removido;
- meta atingida;
- Intent revelada;
- solicitação de aprovação;
- marcação de leitura.

## Prioridade 3 — descoberta e reputação

### 7. Explorar e busca

- pessoas;
- Intents;
- categorias;
- assuntos;
- filtros sem dados inventados.

### 8. Rankings e destaques

Filtros planejados:

- dia, semana, mês, ano e todo o período;
- assunto e categoria;
- mais realizados;
- maior mobilização;
- maior participação;
- mais curtidos;
- novos criadores;
- em crescimento.

Não haverá ranking absoluto único nem números fictícios.

### 9. Reputação explicável

Dimensões separadas:

- Intents criadas;
- Intents realizadas;
- apoios dados;
- apoios recebidos;
- curtidas recebidas;
- aprovações realizadas;
- participação;
- frequência;
- mobilização por pessoas únicas;
- confiabilidade com amostra mínima.

> O Intent não será somente uma rede onde acontecimentos são criados. Será também uma rede onde as pessoas constroem reputação pública pela capacidade de criar, participar, mobilizar e realizar acontecimentos.

## Prioridade 4 — comunicação social

- publicações comuns;
- compartilhamento de Intent por link;
- salvar e acompanhar;
- mensagens privadas simples;
- compartilhar uma Intent no chat;
- moderação e denúncias;
- bloqueio de usuários.

---

# 4. Funcionalidades futuras preservadas

## 4.1 Intent de Escolha

A pergunta **“O que você quer fazer acontecer?”** futuramente poderá oferecer dois caminhos:

- **Eu já decidi:** outras pessoas ajudam algo definido a acontecer.
- **Quero que escolham:** outras pessoas decidem qual resultado acontecerá.

A Intent de Escolha não será uma enquete comum. Deve possuir compromisso, prazo, participação mínima, voto único, desempate, resultado e impacto na reputação.

## 4.2 Intents como guardiãs de outras Intents

Uma Intent poderá depender do estado ou realização de outra Intent.

Exemplo: uma liberação institucional depende simultaneamente de auditoria técnica concluída e apoio mínimo alcançado.

Requisitos antes da implementação:

- grafo acíclico dirigido;
- detecção de dependências circulares;
- propagação assíncrona de eventos;
- reavaliação idempotente;
- visualização simples da árvore de dependências;
- proteção contra cascatas infinitas.

## 4.3 Motor universal de condições

- AND, OR e NOT;
- N de M;
- sequência;
- janela de tempo;
- múltiplas etapas;
- fontes manuais e externas;
- simulador visual;
- editor progressivo sem expor a DSL ao usuário comum.

## 4.4 Integrações externas

O modelo está conceitualmente preparado para:

- `UPLOAD`;
- `MANUAL`;
- `LINK`;
- `API`;
- `WEBHOOK`.

A API pública e os webhooks serão ativados somente depois de autenticação de serviços, assinatura, idempotência, rate limit e auditoria. Sistemas externos devem adaptar seus eventos ao contrato do Intent; o núcleo do Intent não será deformado para cada integração.

## 4.5 Armazenamento e criptografia avançados

- OCI Object Storage para imagens e arquivos;
- URLs temporárias;
- OCI Vault/KMS;
- rotação de chaves;
- envelopes portáveis;
- hash chains;
- provas criptográficas avançadas somente quando houver necessidade real.

## 4.6 Plataforma e operação

- domínio e HTTPS;
- publicação controlada;
- backup externo;
- ensaio de restauração;
- CI/CD;
- staging;
- observabilidade;
- alertas;
- políticas de retenção;
- aplicação mobile futura.

---

# 5. Fora do escopo imediato

Não implementar agora:

- microserviços;
- Kubernetes;
- blockchain;
- ZK-Proofs;
- pagamentos;
- chamadas de voz ou vídeo;
- transmissão ao vivo;
- IA generativa dentro do produto;
- API pública;
- webhooks ativos;
- aplicativo nativo;
- reputação complexa sem dados suficientes.

---

# 6. Próxima decisão do projeto

A próxima decisão deve ocorrer somente após o teste humano do feed “Seguindo”.

Se o teste for aprovado, a recomendação é iniciar **curtidas e comentários reais**, pois essa entrega transforma o feed existente em um espaço de interação social sem antecipar a complexidade de chat, ranking ou motor avançado de condições.

---

*Intent — Rede Social de Acontecimentos*  
**Pergunta central:** O que você quer fazer acontecer?
