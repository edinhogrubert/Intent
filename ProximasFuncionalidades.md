# Roteiro de Próximas Funcionalidades (Roadmap & Arquitetura Futura)

Este documento registra as propostas de expansão arquitetural e melhorias conceituais planejadas para as próximas fases do sistema **Intent OS**.

---

## 1. Composabilidade de Intenções (Intents como Guardiões/Aprovadores)

### 📌 Conceito
Permitir que uma **Intent A** utilize o estado, a resolução ou a aprovação de uma **Intent B** (ou grupo de sub-intents) como condição ou guardião para sua própria execução ou revelação.

* **Exemplo de Caso de Uso:** A `Intent_Orçamento_Projeto` só é liberada se a `Intent_Auditoria_Técnica` atingir o status `SATISFIED` e a `Intent_Apoio_Comunitário` atingir 100 apoios na Etapa 7.

---

### 🔍 Por que postergar para a Fase 2 (Pós-MVP)?

Embora a funcionalidade seja altamente coerente e expanda o sistema para um modelo de orquestração institucional avançado, a decisão técnica de diferir sua implementação baseia-se em quatro pilares:

1. **Prevenção de Dependências Circulares (*Deadlocks*):**
   * Se a Intent A depender da Intent B e a Intent B depender da Intent A, o sistema entra em um impasse irresolvível.
   * *Requisito Técnico:* É necessário implementar um algoritmo de verificação de **Grafo Acíclico Dirigido (DAG)** antes de permitir salvar a associação.

2. **Propagação de Estado em Cascata (*Event Cascading*):**
   * A mudança de estado de uma Intent precisa disparar uma reavaliação assíncrona em todas as Intents dependentes cadastradas no banco de dados.
   * *Requisito Técnico:* Exige uma camada de barramento de eventos (*Event Bus*) ou gatilhos reativos (*Firestore Triggers*).

3. **Complexidade de Interface e UX:**
   * Apresentar visualmente uma cadeia de dependências aninhadas (árvore de dependências) exige componentes visuais dedicados para que os usuários acompanhem claramente o status do fluxo.

4. **Preservação da Estabilidade e Clareza do MVP (Etapas 1 a 8):**
   * O MVP atual consolida as 8 Etapas fundamentais (Identidade, Intenção, Tempo, Pessoas, Quórum, Cofre AES-256-GCM, Participação Coletiva e Histórico Social).
   * Manter essas etapas isoladas e testadas garante um núcleo estável e sem riscos de regressão.

---

### 🛠️ Estratégia de Implementação Futura

Quando a funcionalidade for integrada na Fase 2, a arquitetura deverá seguir este roteiro:

#### A. Extensão do Modelo de Dados (`src/types.ts`)
O tipo `Participant` (que hoje concentra também os guardiões via `role: 'guardian' | 'approver'`) será estendido com um discriminador de entidade, preservando os valores atuais de `status`:

```typescript
export interface Participant {
  id: string;
  name: string;
  email: string;
  role: ParticipantRole;           // 'recipient' | 'guardian' | 'approver' | 'participant' | 'viewer'
  status: ParticipantStatus;       // 'pending' | 'approved' | 'declined'
  entity_type?: 'USER' | 'INTENT'; // NOVO: usuário humano ou outra Intent
  target_intent_id?: string;       // NOVO: ID da Intent guardiã (caso entity_type === 'INTENT')
  required_status?: 'SATISFIED' | 'REVEALED'; // NOVO: estado exigido da Intent guardiã
}
```

#### B. Algoritmo de Detecção de Ciclos (DAG)
Antes de associar a Intent B como guardiã da Intent A, o backend/serviço executará uma busca em profundidade (DFS) para garantir ausência de ciclos:

```typescript
function detectCycle(sourceIntentId: string, targetIntentId: string): boolean {
  // Retorna true se targetIntentId já depende direta ou indiretamente de sourceIntentId
}
```

#### C. Avaliador de Condição Reativo
O utilitário `evaluateIntentConditions` consultará recursivamente o status da Intent guardiã para determinar se a aprovação condicional foi concedida.

#### D. Visualizador de Árvore de Dependências na UI
Criação de um componente `<IntentDependencyTree />` no painel da Intent para mapear visualmente todas as sub-intents e seus respectivos status em tempo real.

---

## 2. Outras Funcionalidades Mapeadas para o Roadmap

* **Etapa 9 — Algoritmo de Reputação & Histórico Ponderado:**
  * Cálculo automatizado de pontuação de reputação com base na assertividade das previsões registradas na Etapa 8.
* **Provas Criptográficas em Cadeia (ZK-Proofs / Hash-Chains):**
  * Vinculação da hash de estado da Intent no momento do fechamento em um registro público imutável.
* **Exportação & Importação de Envelopes Portáveis:**
  * Permitir o download do envelope cifrado AES-256 `.vault` para custódia 100% offline do usuário.
