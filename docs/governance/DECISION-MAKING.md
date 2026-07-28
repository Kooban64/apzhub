# APZOR Decision Authority

> **Programme:** APZHUB-GOVERNANCE-001  
> **Date:** 2026-07-20

---

## Decision classes

| Class                               | Authority                         | Examples                                                                                |
| ----------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------- |
| **D0 — Owner**                      | Owner only                        | Platform/product SemVer Acceptance; STOP reopen; new vertical products; freeze unfreeze |
| **D1 — Executive / Platform Owner** | Platform Owner (+ Owner informed) | Shared capability priority within authorised roadmap                                    |
| **D2 — Committee**                  | ARB / CAB / ORB / Security / Risk | ADR recommend; change approve; ops risk treat                                           |
| **D3 — Role**                       | Named R/A role                    | Service Owner runbook update; L2 restore                                                |
| **D4 — Team**                       | Delivery team                     | Implementation detail within approved programme                                         |

## Decision path (standard programme)

```text
Evidence (AI-MANIFEST / packs)
  → Recommendation
  → Owner Approval (named programme)
  → Implement (if engineering authorised)
  → Test / Certify
  → Owner Acceptance
  → Bootstrap
```

## Incident escalation (enterprise)

| Level     | When                                        | Who                      |
| --------- | ------------------------------------------- | ------------------------ |
| L1        | User / ticket                               | Production Support       |
| L2        | Service diagnosis                           | Service Owner / engineer |
| L3        | Cross-service / security                    | Ops Lead / Security      |
| Executive | Baseline threat, brand/legal, STOP pressure | Owner                    |

Never escalate by disabling AuthZ.

## Repository governance decisions

Conversation history is **never** authority. Disk + KF + Acceptance registers win.
