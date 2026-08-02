# Product Board Recommendation — APZQEP-151

| Field        | Value                                                                         |
| ------------ | ----------------------------------------------------------------------------- |
| Programme    | APZQEP-151                                                                    |
| Title        | Durable Product Persistence                                                   |
| Status       | **RECOMMENDED · NOT AUTHORISED**                                              |
| Prerequisite | APZQEP-150 **CERTIFIED** (readiness audit passed; production NO-GO on RB-001) |
| Clears       | **RB-001**                                                                    |
| Authority    | Product Board recommendation                                                  |
| Timestamp    | 20260802T192200Z                                                              |

---

## Objective (single)

Replace LIMITED_AVAILABILITY in-memory sources of record with **PostgreSQL-backed durable persistence** for Capabilities A–F.

**Nothing else.**

---

## In scope

- Durable SoR for Caps A–F product data / metadata currently process-local
- Migration / repository adapters consistent with existing Cap packages
- Tests and certification evidence for persistence durability and restart survival
- Disclosure updates to Known Limitations / LIMITED_AVAILABILITY posture for RB-001

## Out of scope

- New capabilities or UX concepts
- RBAC changes (APZQEP-152)
- AI, ALM, integrations, reporting redesign
- Reopening APZQEP-120 / APZQEP-140 feature programmes
- Production release or deployment

---

## Authorisation gate

Engineering **SHALL NOT** begin until Owner Authorisation Pack:

```text
Status: AUTHORISED
Repository: Engineering Authorised
```

One authorised programme at a time. After 151 and 152: re-run APZQEP-150 readiness audit.
