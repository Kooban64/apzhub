# APZHUB Engineering Lifecycle

| Field     | Value                            |
| --------- | -------------------------------- |
| Programme | APZHUB-ENG-003                   |
| Status    | **IN FORCE** (adoption guidance) |
| Timestamp | 20260803T075550Z                 |

## Purpose

Single enterprise engineering operating model for every APZHUB product. Generalised from the APZQEP Version 1.0 reference implementation.

## End-to-end stages

```text
Owner Authorisation
        ↓
Architecture / Product Planning
        ↓
Platform / Capability Engineering (slices · programmes)
        ↓
Independent Readiness Audit
        ↓
Remediation programmes (if release blockers)
        ↓
Re-certification Audit (if remediated)
        ↓
Product Board Release Decision
        ↓
General Availability
        ↓
Operations-led Governance
        ↓
Evidence-driven Version N+1 Planning (Board only)
```

## Mandatory principles

1. **Explicit Owner authorisation** before engineering.
2. **Engineering before release** — no silent GA.
3. **Independent certification / readiness** — auditors do not remediate.
4. **Product Board decisions** authorise release — audit only recommends.
5. **Immutable historical audits** — do not rewrite NO-GO history.
6. **Release blocker management** — clear or stop; do not bury.
7. **Evidence-first governance**.
8. **Operations-led evolution** after GA.
9. **No engineering during certification audits**.
10. **No engineering during Product Board resolutions**.

## Standards consumed (unchanged by this programme)

| Layer              | Authority                              |
| ------------------ | -------------------------------------- |
| Specify            | ES-003                                 |
| Test               | ES-001                                 |
| Certify            | ES-002                                 |
| Slice delivery     | APZHUB-ENG-001                         |
| Governance version | APZHUB-ENG-002 · Governance 1.0 STABLE |

## Reference implementation

**APZQEP Version 1.0** — Platform Foundation → Core Capabilities → Readiness (NO-GO) → Remediation → Re-certification (GO) → Board GO → GA → Ops-001.
