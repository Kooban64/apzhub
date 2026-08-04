# CERTIFICATION-PLAN — APZQEP-165-PLAN

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-165-PLAN  |
| Timestamp | 20260804T060307Z |

## Per-slice certification gate (mandatory)

Every slice **165-S01…S18** must produce and pass:

| Gate                 | Requirement                                                           |
| -------------------- | --------------------------------------------------------------------- |
| Unit tests           | Slice-owned units; CI green                                           |
| Integration tests    | Contract-level tests with fakes/mocks of peers                        |
| Regression tests     | Scoped suite from REGRESSION-PLAN for touched contracts               |
| Security review      | Authz, validation, secret handling, least privilege for slice surface |
| Documentation review | Slice docs per DOCUMENTATION-PLAN                                     |
| Evidence pack        | Timestamped under `evidence/apzqep-165-sNN/`                          |
| Completion report    | Slice COMPLETION with architecture-unchanged attestation              |

## Standards

- ES-001 testing expectations apply to engineering slices.
- ES-002 certification discipline for Board-facing programme close (PBR-APZQEP-165 after 165R).
- ES-003 specification template for slice Owner Auth specs.

## Programme-level certification (S18 + 165R)

| Level                 | When                |
| --------------------- | ------------------- |
| Slice certified       | After each S0n gate |
| Wave eng complete     | After S18           |
| Operational readiness | APZQEP-165R         |
| Board CERTIFIED       | PBR-APZQEP-165      |

## No silent skips

Failing slice gate **blocks** successor Owner Auth on the critical path.
