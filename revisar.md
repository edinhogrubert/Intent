# 📋 Revisão Arquitetural Sênior: Validação das Etapas 1 a 8 & Preparação da Etapa 9

**Projeto:** Intent Applet Architecture  
**Data da Auditoria:** 15 de Agosto de 2026  
**Status do Sistema:** Etapas 1 a 8 implementadas e validadas manualmente na interface, integradas com persistência (Firestore + Local Storage) e telemetria de causalidade.  
**Ressalva:** o repositório ainda não possui suíte de testes automatizados — a validação abaixo é funcional/manual.

---

## 🎯 Visão Geral do Ciclo de Vida do Sistema

```text
1. IDENTIDADE (Quem é você?)
       ↓
2. INTENT (O que você quer que aconteça?)
       ↓
3. TEMPO (O sistema consegue esperar e revelar?)
       ↓
4. PESSOAS (Para quem / quem participa?)
       ↓
5. APROVAÇÃO (Pessoas podem determinar a realização?)
       ↓
6. SEGURANÇA (O conteúdo permanece protegido até a revelação?)
       ↓
7. PARTICIPAÇÃO (Uma meta coletiva pode fazer algo acontecer?)
       ↓
8. HISTÓRICO (Existe vida social além da Intent?)
       ↓
──────────────────────────────────────────────────────────────────
9. IMPACTO & REPUTAÇÃO (Fase Futura — Alavancada pelos dados 1-8)
```

---

## 🧪 Matriz dos 8 Testes Concretos de Prova

Cada etapa foi desenhada para atender a um teste rigoroso, autônomo e auditável, sem atalhos ou gambiarras no modelo de dados.

| Etapa | Pergunta Fundamental | Teste Concreto | Evidência de Implementação & Modelo de Dados | Status |
| :--- | :--- | :--- | :--- | :---: |
| **1. Identidade** | *Quem é você?* | **João cria conta e volta a encontrá-la.** | Sessão via Firebase Auth + Local Storage (`UserAccount` em `src/utils/storage.ts`). Persiste nome, username, email, avatar e preferências entre sessões. | `VALIDADO ✓` |
| **2. Intent** | *O que você quer que aconteça?* | **João cria uma Intent e consegue consultá-la.** | Entidade `Intent` com título, descrição, `created_at`, status (`draft`, `active`, `completed`, `cancelled`) e persistência no Firestore com fallback local. | `VALIDADO ✓` |
| **3. Tempo** | *O sistema consegue esperar e revelar?* | **João cria "revelar amanhã" e o sistema efetivamente revela.** | Motor `conditionEvaluator.ts` + `timeCondition.ts` com operadores temporais (`TimeOperator`: `>=`, `<=`, `BETWEEN`, `WINDOW`) e revelação após a data-alvo. | `VALIDADO ✓` |
| **4. Pessoas** | *Para quem / quem participa?* | **João cria uma Intent para Flávio.** | Papéis explícitos em `Participant.role` (`ParticipantRole`): `recipient`, `guardian`, `approver`, `participant`, `viewer`, com múltiplos papéis via `roles[]` e separação tripla em `IntentPeople` (approvers / recipients / participants). | `VALIDADO ✓` |
| **5. Aprovação** | *Pessoas determinam a realização?* | **João cria "2 de 3 aprovadores".** | Quórum formal em `IntentConditions` (`quorum_mode: 'EXACT_N'`, `required_approvals: 2`, `eligible_approvers: 3`), calculado por `calculateEffectiveRequiredApprovals()`. Suporta `UNANIMOUS`, `MAJORITY`, `SUPERMAJORITY`, `EXACT_N` e `PERCENTAGE`. | `VALIDADO ✓` |
| **6. Segurança** | *O segredo permanece protegido?* | **João coloca um documento protegido e ele permanece inacessível antes da condição.** | Envelope de Segurança (`ProtectedPayload`): criptografia cliente AES-256-GCM (Web Crypto, chave derivada por PBKDF2), `content_hash` SHA-256, `commitment` pré-revelação e `key_status` lacrado (`SEALED`) até a resolução da condição. | `VALIDADO ✓` |
| **7. Participação** | *Meta coletiva pode fazer algo acontecer?* | **João cria "100 apoios → revelar por 24h".** | Protocolo `CONDITION ➔ REVEAL_WINDOW ➔ EXPIRATION` via `PublicParticipationConfig` (`target_supports`, `current_supports`, `supporters[]`) e `RevealWindowConfig` (`duration_hours`, `expires_at`, `is_expired`). | `VALIDADO ✓` |
| **8. Histórico** | *Existe vida social além da Intent?* | **Maria publica uma opinião sobre a Intent de João, outras pessoas concordam/discordam e comentam, sem alterar a regra da Intent.** | Entidade `SocialPost` desacoplada (`PostCategory: 'GENERAL' \| 'INTENT_OPINION' \| 'PREDICTION' \| 'DEBATE'`). Debates com contadores `[Concordo 183] [Discordo 241]`. O debate **não** altera a condição da Intent. | `VALIDADO ✓` |

---

## 🔒 Princípio de Isolamento: Opinião vs. Condição

Um pilar central da Etapa 8 é o desacoplamento estrito entre a camada social e o motor criptográfico de execução:

$$\text{HISTÓRICO} \longrightarrow \text{Opinião} \quad \neq \quad \text{INTENT} \longrightarrow \text{Condição}$$

- **Caso Real:** Maria publica: *"Não acho que essa meta será atingida."*
- **Debate:** 183 usuários clicam em *Concordo* e 241 clicam em *Discordo*, com 42 comentários.
- **Resultado na Intent:** **Zero impacto na regra**. A meta de 100 apoios ou a trava de 24h permanecem puras e inalteradas.

---

## 📊 Telemetria de Eventos para a Futura Etapa 9 (Impacto & Reputação)

Conforme a orientação sênior, **NÃO** foram implementados rankings artificiais, pontuações, moedas ou gamificação prematura. Em vez disso, o sistema registra com integridade absoluta os **6 eventos primitivos de proveniência**:

### 1. Primitivas de Registro Armazenadas
1. **Quem criou:** `creator_id` registrado em cada Intent e Post.
2. **Quem participou / apoiou:** Lista de `supporters` (`Supporter`) com `supported_at`, comentário e origem da indicação.
3. **Quem convidou (Causalidade):** `CausalityAttribution` gravando `source_user_id` e `source_user_name` (ex: *Fernando source = Flávio*).
4. **Quem aprovou:** Aprovações dos guardiões registradas em `Participant.status = 'approved'` (+ `approved_at`) e no log `GUARDIAN_APPROVED`.
5. **Quem recebeu:** Destinatários mapeados com `role: 'recipient'` em `IntentPeople.recipients`.
6. **Qual Intent foi concluída:** Transição de estado com registro de timestamp e autor do desbloqueio.

### 2. Cadeia Causal Registrada (Exemplo Real)
```text
João criou a Intent (Meta 100)
       ↓
Flávio apoiou a Intent (+1)
       ↓
Flávio convidou Fernando (source = Flávio)
       ↓
Fernando apoiou a Intent (+1, atribuído à influência de Flávio)
       ↓
Meta de 100 apoios atingida ➔ Janela de 24h aberta
```

### 3. Registro de Previsões Formais
```text
PREVISÃO FORMAL ("Prevejo que a Intent não será concluída")
       ↓
RESOLUÇÃO DA INTENT (Concluída com Sucesso)
       ↓
EVENTO GERADO: PREDICTION_RESOLVED (PredictionDetail.resolved_status: INCORRECT, resolved_at: ISO)
       ↓
(Alimentará a Reputação na Etapa 9)
```

---

## 🚀 Prontidão para a Etapa 9

Com todas as 8 etapas validadas por testes concretos e com o histórico e rastreamento de causalidade devidamente gravados, o sistema possui a fundação ideal para construir:
1. **Métricas de Impacto Real** (*"Flávio ajudou a mobilizar 3.240 participações"*).
2. **Reputação por Acurácia de Previsão** (Baseada no histórico de acertos e erros).
3. **Contribuição & Mobilização Comunitária**.
4. **Rede de Afinidade Seguidores/Seguindo** com relevância ponderada por impacto verificado.
