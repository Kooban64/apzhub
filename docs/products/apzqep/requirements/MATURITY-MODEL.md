# APZ QEP — Quality Engineering Maturity Model

> **Programme:** APZQEP-REQ-001 · IDs: MM-*  
> **Purpose:** Progressive organisational maturity — product shall support each stage without forcing the highest stage for MVP.

## Maturity stages

```text
Manual Verification
  → Structured Verification
    → Automated Verification
      → AI-assisted Verification
        → Continuous Verification
          → Continuous Certification
```

| Level  | Name                     | Organisation behaviour                                  | QEP capabilities required               | Typical priority horizon              |
| ------ | ------------------------ | ------------------------------------------------------- | --------------------------------------- | ------------------------------------- |
| **L1** | Manual Verification      | Ad-hoc or spreadsheet testing                           | Manual procedures, runs, basic evidence | P0 MVP                                |
| **L2** | Structured Verification  | Plans/suites/procedures; requirements linked            | FR plans/suites/procedures/traceability | P0 MVP                                |
| **L3** | Automated Verification   | CI results linked into SoR                              | Automation ingest, CI metadata          | P0–P1                                 |
| **L4** | AI-assisted Verification | AI drafts/reviews under human gates                     | AIR-* (default OFF until authorised)    | P1–P2                                 |
| **L5** | Continuous Verification  | Ongoing pipeline/monitor signals in SoR                 | Continuous run types, dashboards        | P2                                    |
| **L6** | Continuous Certification | Certification state maintained with re-cert human gates | Continuous certification + readiness    | P0 core model; advanced automation P2 |

## Requirements

| ID     | Requirement                                                                     | Priority | Risk     | Acceptance criteria                                    |
| ------ | ------------------------------------------------------------------------------- | -------- | -------- | ------------------------------------------------------ |
| MM-001 | Product shall support progression L1→L6 without discarding prior-stage SoR data | P0       | High     | Migration path between stages documented in Definition |
| MM-002 | MVP shall deliver L1–L2 fully and L3 foundational ingest                        | P0       | Critical | FR P0 set covers L1–L3 foundation                      |
| MM-003 | L4 capabilities shall not enable auto-certify                                   | P0       | Critical | AIR-013 / AIR-021                                      |
| MM-004 | L6 requires human approval for certification state changes                      | P0       | Critical | FR-018                                                 |
| MM-005 | Maturity assessment view (optional) shows org stage and gaps                    | P2       | Low      | Dashboard intent                                       |

## Notes

- Maturity is organisational capability, not a license lock — though advanced AI/connectors may be tier-gated (CR-003).
- Historical TCMS 1.0.0 packaging maps roughly to L2–L3 with certification primitives.
