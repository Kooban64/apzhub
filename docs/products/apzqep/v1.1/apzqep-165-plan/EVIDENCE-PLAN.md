# EVIDENCE-PLAN — APZQEP-165-PLAN

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-165-PLAN  |
| Timestamp | 20260804T060307Z |

## Plan programme evidence (this programme)

Under `evidence/apzqep-165-plan/20260804T060307Z/`:

- Execution Planning
- Slice Definition
- Dependency Review
- Certification Planning
- Regression Planning
- Rollback Planning
- Risk Assessment
- Operational Readiness Planning
- Completion

## Per engineering slice (future)

`evidence/apzqep-165-sNN/<UTC>/` must include at least:

| Artefact               | Content                                            |
| ---------------------- | -------------------------------------------------- |
| Engineering evidence   | Scope, commits, packages touched                   |
| Testing evidence       | Unit/integration/regression summaries              |
| Security evidence      | Review notes / checks                              |
| Certification evidence | Gate checklist PASS                                |
| Completion evidence    | COMPLETION.md + architecture-unchanged attestation |

## Rules

- Timestamped UTC folders
- No secrets in evidence
- Link to CI runs where available
