# Wave 03 — Application

| Item     | Value                                        |
| -------- | -------------------------------------------- |
| Wave     | **03 — Application**                         |
| Version  | **1.0.0**                                    |
| Parent   | [README.md](./README.md)                     |
| Contract | [../BUILD-CONTRACT.md](../BUILD-CONTRACT.md) |
| Prior    | [WAVE-02-DOMAIN.md](./WAVE-02-DOMAIN.md)     |

**Normative language:** **SHALL** / **MUST** = mandatory; **SHOULD** = strong recommendation; **MAY** = optional.

---

## Objectives

1. Implement Application/Platform Service orchestration per Accepted ES.
2. Enforce validation, permissions, audit hooks, and event publication as specified — before connector calls.
3. Map Domain outcomes to Application/API error categories without leaking backend details.
4. Provide unit/integration tests appropriate to Application behaviour.
5. File continuous evidence for Owner Wave Review.

---

## Authorised scope

Wave 03 **MAY** include:

- Application services / use-case orchestration
- Authz checks via platform Permission patterns
- Transactional boundaries as specified (without Infrastructure adapter implementation if deferred to Wave 04)
- Event publication orchestration (not Notification Framework delivery)
- Application-level tests

Wave 03 **SHALL** require Wave 02 Acceptance (or Owner-recorded exception).

---

## Prohibited activities

1. Redesigning Domain invariants in Application code.
2. Direct connector/backend calls that skip the Adapter layer.
3. Workbench UI production implementation (Wave 05).
4. Infrastructure persistence/HTTP details belonging to Wave 04, unless Owner Instruction explicitly combines.
5. Module-to-module coupling or private notification/search subsystems.
6. Auto-starting Wave 04.

---

## Success criteria

| Criterion     | Requirement                               |
| ------------- | ----------------------------------------- |
| Orchestration | ES Application contracts implemented      |
| Security      | Authz/validation fail-closed as specified |
| Errors        | Typed mapping; no raw backend leakage     |
| Tests         | Application tests for new behaviour       |
| Build         | Repository buildable; gates pass          |
| Evidence      | Continuous evidence + Deviation Register  |

---

## Stop condition

**IMPLEMENTED / AWAITING OWNER WAVE REVIEW** for Wave 03.

**STOP** on Architecture/ES conflict, missing Domain prerequisites, or authz/audit gaps that require Owner Decision.

---

## Owner decision gate

| Decision            | Effect                                     |
| ------------------- | ------------------------------------------ |
| ACCEPTED            | Wave 04 **MAY** be separately authorised   |
| RETURN FOR REVISION | Remediate under Wave 03                    |
| REJECTED            | Stop; Owner directs remediation / rollback |

---

## STOP

```text
WAVE 03 APPLICATION
ORCHESTRATION ONLY
AWAITING OWNER WAVE REVIEW
```
