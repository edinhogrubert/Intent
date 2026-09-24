# Bloco 37A — métricas objetivas e conquistas

## Auditoria e decisão

| Métrica/conquista | Fonte real | Histórico ou derivada | Pública? | Decisão |
| --- | --- | --- | --- | --- |
| Intents criadas | `Intent.count` com `PUBLIC` e `PUBLISHED/REALIZED` | derivada atual | sim, apenas públicas | manter |
| Intents realizadas | `Intent.count` com `status=REALIZED` no mesmo escopo | derivada atual | sim, apenas públicas | manter |
| Taxa de realização | realizadas / Intents públicas elegíveis (`PUBLISHED` ou `REALIZED`) | derivada atual | sim, sem amostra privada | criar |
| Apoios recebidos | `Support.count` relacionado a Intents públicas do criador | derivada atual | sim | manter |
| Participações realizadas | Intents públicas realizadas com apoio, comentário ou reação do usuário | derivada atual, contando Intent distinta | sim | manter |
| Primeira Intent | contador público de criação >= 1 | marco derivado, sem data | sim | criar |
| Primeira realização | contador público de realizações >= 1 | marco derivado, sem data | sim | criar |
| Cinco/dez realizações | contador público de realizações >= 5/10 | marco derivado, sem data | sim | criar |
| Primeira participação realizada | contador público de participações realizadas >= 1 | marco derivado, sem data | sim | criar |

As métricas são calculadas no serviço de perfil existente e não são persistidas. Conquistas têm identificadores estáveis e não possuem `achievedAt`, pois o histórico disponível não comprova o instante em que o marco foi atingido. Apoios, reações e comentários continuam separados; não existe score, ranking ou nota de confiabilidade.

## Privacidade e limites

O escopo público exclui Intents `PRIVATE`, `FOLLOWERS`, não publicadas e criadores inativos, inclusive na consulta do próprio perfil público. Nenhuma conquista ou métrica revela título, participante, guardião ou existência de atividade restrita. Mobilização de pessoas únicas, aprovações de guardião e marcos históricos com data permanecem fora deste bloco por não terem uma projeção histórica pública segura.

## Validação

O contrato público inclui `realizationEligibleCount`, `realizationRate` (`null` sem Intents elegíveis) e `achievements`. A interface apresenta as conquistas somente quando há marcos verificáveis e mantém as métricas existentes do perfil.
