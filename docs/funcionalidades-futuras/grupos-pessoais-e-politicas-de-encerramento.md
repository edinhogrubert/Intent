# Intent — Funcionalidades futuras: grupos pessoais e políticas de encerramento

> **Status:** proposta de produto; não implementada; não autoriza alteração no motor de regras, migrations, deploy nem nos Blocos 35–39.
> **Origem:** especificação do proprietário, 20 de setembro de 2026.
> **Identidade:** uma Intent é o acontecimento, sua condição e sua revelação. Não criar comunidades, feed próprio de grupos, motor paralelo ou apoio fictício.

## 1. Grupos pessoais — atalhos de seleção

Grupos como Futebol, Vôlei, Família, Trabalho, Escola e Dança são **listas pessoais reutilizáveis**, vinculadas à conta, para pré-selecionar aprovadores/guardiões ou destinatários em uma Intent comum. O grupo não possui publicação, feed, regras, contadores de aprovação ou vida social independente. Na criação da Intent, escolher pessoas individualmente ou preencher a seleção com um ou mais grupos; permitir revisar, adicionar e remover participantes antes da confirmação, deduplicando pessoas presentes em vários grupos. A lista resultante é um **snapshot por Intent**: futuras alterações no grupo não mudam autorizações de Intents anteriores sem ação explícita e auditada. Permissões, acesso e aprovação continuam definidos e executados pela Intent e pelo backend, não pelo grupo.

Exemplo: grupo Futsal com 20 pessoas, selecionado como aprovadores de uma Intent que exige 12 de 20 confirmações. Criar grupo não equivale a aprovar, apoiar nem garantir participação. Uma evolução opcional de gestão compartilhada só deve ser considerada se houver necessidade real; não converter a função em comunidade.

## 2. Separar meta atingida, encerramento e realização/revelação

O criador seleciona uma política de encerramento e um prazo, quando aplicável. Meta atingida pode ser provisória ou definitiva conforme essa escolha. Não tratar automaticamente toda meta alcançada como realização imediata. As regras configuradas são informadas antes da participação, preservadas e auditáveis. Diferenciar `SUPPORT` (apoio) de `GUARDIANS` (aprovação); não trocar sua semântica.

### A. Encerrar apenas no prazo — quórum dinâmico (futsal)

Exemplo: 20 aprovadores, 12 aprovações necessárias, prazo quinta-feira às 18h. Até o horário final, a meta pode oscilar: 12 aprovam na quarta; uma pessoa desiste e a contagem cai para 11; outra entra e volta a 12. Atingir o quórum antes do prazo **não encerra nem revela** a Intent. No instante final, congelar a lista válida e avaliar a condição de modo atômico. Se houver ao menos 12 aprovações válidas, realizar a Intent e revelar o conteúdo original. Se houver menos de 12, encerrar como não realizada, **não revelar o conteúdo do cofre** e mostrar a mensagem alternativa escolhida pelo criador, por exemplo: 'Não vai sair jogo'. Não aceitar aprovações/retiradas tardias que alterem retroativamente o resultado. Definir previamente quem pode desistir ou ocupar vagas e manter trilha de alterações. A regra 'confirmou, pagou' pode ser apresentada pelo organizador, mas confirmação não comprova pagamento.

### B. Encerrar imediatamente pela meta — vagas/benefícios limitados (salão)

Exemplo: os primeiros 20 apoios elegíveis reservam 20 brindes, com prazo máximo terça-feira. Ao receber o 20º apoio válido, encerrar novas inscrições imediatamente, finalizar conforme as regras e registrar a lista definitiva de beneficiários. Não transferir automaticamente a vaga ou o brinde de alguém que posteriormente não compareça; distinguir brinde reservado de brinde entregue e explicitar previamente condições, validade e comparecimento. O prazo máximo e o resultado de insucesso caso a meta não seja atingida devem ser configuráveis e claros. Garantir contagem/fechamento atômicos sob concorrência, limite de vagas e idempotência.

## 3. Resultado alternativo no prazo

Quando o prazo termina sem cumprir a meta, mostrar apenas a **mensagem alternativa de insucesso** configurada pelo criador. Essa mensagem não é a revelação do cofre e não pode expor o conteúdo protegido. Distinguir estado não realizado, realizado, meta provisoriamente atingida e inscrições encerradas. No modelo de prazo, avaliar no fechamento; no modelo de meta, encerrar pela condição, podendo existir prazo máximo caso ela não seja atingida.

## 4. Definições obrigatórias antes da implementação

- Estados e transições versionados, imutabilidade da regra após publicação e compatibilidade de Intents existentes.
- UTC/fuso exibido ao usuário, instante preciso de corte, agendamento confiável e falhas/atrasos de execução.
- Autorização para confirmar, retirar confirmação, substituir participante e ver dados de terceiros.
- Concorrência, transações atômicas, idempotência, auditoria e proteção do conteúdo cifrado.
- Mensagem alternativa, consequências de não atingir meta e regras transparentes de ofertas limitadas.
- Não presumir comprovante de pagamento, comparecimento ou entrega de benefício sem evento verificável.

**Implementação apenas mediante autorização específica do proprietário.**