# Wave 04 — Infrastructure & API

| Item     | Value                                              |
| -------- | -------------------------------------------------- |
| Wave     | **04 — Infrastructure & API**                      |
| Version  | **1.0.0**                                          |
| Parent   | [README.md](./README.md)                           |
| Contract | [../BUILD-CONTRACT.md](../BUILD-CONTRACT.md)       |
| Prior    | [WAVE-03-APPLICATION.md](./WAVE-03-APPLICATION.md) |

**Normative language:** **SHALL** / **MUST** = mandatory; **SHOULD** = strong recommendation; **MAY** = optional.

---

## Objectives

1. Implement Infrastructure adapters (persistence, messaging ports, engine clients) per Accepted ES.
2. Expose platform REST (or specified) API surfaces matching ES catalogues.
3. Enforce request validation, auth, authz, audit, correlation IDs, and standard response envelopes.
4. Provide unit/integration/API tests as applicable.
5. File continuous evidence for Owner Wave Review.

---

## Authorised scope

Wave 04 **MAY** include:

- Repositories / mappers / migrations for platform metadata as specified (never duplicate engine SoR without cache/search justification)
- Route handlers / server actions wiring to Application services
- Adapter error translation; circuit-breaker/retry hooks if specified
- Health reporting for the capability’s infrastructure surface
- API documentation for public resources introduced

Wave 04 **SHALL** require Wave 03 Acceptance (or Owner-recorded exception).

---

## Prohibited activities

1. Business rules belonging in Domain/Application implemented only in Infrastructure.
2. Exposing raw backend/engine errors or branding to clients.
3. Workbench UI production implementation (Wave 05).
4. Modifying frozen baselines or unrelated capabilities.
5. Skipping API authz/validation/audit required by ES.
6. Auto-starting Wave 05.

---

## Success criteria

| Criterion    | Requirement                              |
| ------------ | ---------------------------------------- |
| API fidelity | Paths, DTOs, permissions match ES        |
| Adapters     | Translate errors; respect layering       |
| Tests        | Integration/API tests for new behaviour  |
| Build        | Repository buildable; gates pass         |
| Security     | Fail-closed on authz/tenant violations   |
| Evidence     | Continuous evidence + Deviation Register |

---

## Stop condition

**IMPLEMENTED / AWAITING OWNER WAVE REVIEW** for Wave 04.

**STOP** on contract conflict, persistence model ambiguity requiring Owner Decision, or inability to keep mainline buildable within scope.

---

## Owner decision gate

| Decision            | Effect                                     |
| ------------------- | ------------------------------------------ |
| ACCEPTED            | Wave 05 **MAY** be separately authorised   |
| RETURN FOR REVISION | Remediate under Wave 04                    |
| REJECTED            | Stop; Owner directs remediation / rollback |

---

## STOP

```text
WAVE 04 INFRASTRUCTURE & API
ADAPTERS + PLATFORM API
AWAITING OWNER WAVE REVIEW
```
