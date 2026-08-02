# Product Board Recommendation — APZQEP-152

| Field        | Value                                                                     |
| ------------ | ------------------------------------------------------------------------- |
| Programme    | APZQEP-152                                                                |
| Title        | Production RBAC Hardening                                                 |
| Status       | **RECOMMENDED · NOT AUTHORISED**                                          |
| Prerequisite | APZQEP-150 **CERTIFIED**; preferably after or coordinated with APZQEP-151 |
| Clears       | **RB-002** (and related HR-001 where in scope)                            |
| Authority    | Product Board recommendation                                              |
| Timestamp    | 20260802T192200Z                                                          |

---

## Objective (single)

Remove remaining HTTP permission-elevation risks and certify **production-grade authorisation** across Cap A–F production paths.

**Nothing else.**

---

## In scope

- Remove LIMITED_AVAILABILITY Cap permission elevation from HTTP handlers
- Prove RBAC / least privilege on every Cap A–F production path
- Address Cap F privileged `system-reporting` aggregation path if required for production authz integrity
- Security certification evidence for production RBAC
- Updates to Known Limitations for RB-002

## Out of scope

- New capabilities, modules, or UX
- Persistence redesign beyond what 151 already delivers
- AI, integrations, platform redesign
- Production release or deployment (requires readiness re-audit)

---

## Authorisation gate

Engineering **SHALL NOT** begin until Owner Authorisation Pack:

```text
Status: AUTHORISED
Repository: Engineering Authorised
```

After APZQEP-151 and APZQEP-152: **re-run APZQEP-150** (same audit programme — not a new band).
