# Wave 02 — Domain

| Item     | Value                                            |
| -------- | ------------------------------------------------ |
| Wave     | **02 — Domain**                                  |
| Version  | **1.0.0**                                        |
| Parent   | [README.md](./README.md)                         |
| Contract | [../BUILD-CONTRACT.md](../BUILD-CONTRACT.md)     |
| Prior    | [WAVE-01-REPOSITORY.md](./WAVE-01-REPOSITORY.md) |

**Normative language:** **SHALL** / **MUST** = mandatory; **SHOULD** = strong recommendation; **MAY** = optional.

---

## Objectives

1. Implement Domain model, commands, invariants, and typed errors per Accepted ES.
2. Keep Domain pure (no infrastructure, HTTP, UI, or connector I/O) where Architecture/ES require purity.
3. Provide Domain unit tests for commands/invariants touched.
4. File continuous evidence for Owner Wave Review.

---

## Authorised scope

Wave 02 **MAY** include:

- Aggregates, entities, value objects, domain services as specified
- Command/query handlers that belong in Domain per ES
- Domain events (raising/publishing contracts as specified — not delivery)
- Domain unit tests
- Package exports required for Application consumption

Wave 02 **SHALL** require Wave 01 Acceptance (or Owner-recorded exception).

---

## Prohibited activities

1. Persistence adapters, HTTP route handlers, Workbench UI, or connector clients.
2. Application orchestration beyond Domain boundaries.
3. Architecture/ES redesign or silent contract drift.
4. Bypass of `availableActions` / domain rules defined by Architecture/ES.
5. Auto-starting Wave 03.
6. Placeholder Domain logic presented as complete.

---

## Success criteria

| Criterion   | Requirement                                |
| ----------- | ------------------------------------------ |
| ES fidelity | Domain matches ES catalogues for this Wave |
| Purity      | No forbidden layer leakage                 |
| Tests       | Domain unit tests for touched behaviour    |
| Build       | Repository buildable; gates pass           |
| Evidence    | Continuous evidence + Deviation Register   |
| Affirmation | Build Contract affirmation present         |

---

## Stop condition

**IMPLEMENTED / AWAITING OWNER WAVE REVIEW** for Wave 02.

**STOP** on Architecture/ES conflict, invariant ambiguity requiring Owner Decision, or inability to satisfy tests within authorised scope without redesign.

---

## Owner decision gate

| Decision            | Effect                                     |
| ------------------- | ------------------------------------------ |
| ACCEPTED            | Wave 03 **MAY** be separately authorised   |
| RETURN FOR REVISION | Remediate under Wave 02                    |
| REJECTED            | Stop; Owner directs remediation / rollback |

---

## STOP

```text
WAVE 02 DOMAIN
PURE DOMAIN ONLY
AWAITING OWNER WAVE REVIEW
```
