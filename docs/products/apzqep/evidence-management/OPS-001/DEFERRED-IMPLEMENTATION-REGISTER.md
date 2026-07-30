# Deferred Implementation Register — APZQEP-OPS-001

| #   | Item                                                   | Authority            | Status                              |
| --- | ------------------------------------------------------ | -------------------- | ----------------------------------- |
| 1   | Storage technology selection                           | ADR-0088             | **DEFERRED** — undecided            |
| 2   | SQL / metadata SoR / migrations                        | ENG waves + ADR-0088 | **DEFERRED**                        |
| 3   | Real StoragePort provider (S3/MinIO/fs/…)              | ADR-0088             | **DEFERRED** — skeleton only        |
| 4   | Event bus publication                                  | ENG-110D/E/F stop    | **DEFERRED** — collector only       |
| 5   | Hashing algorithm implementation (SHA-256 default)     | OES-ENG-091A         | **DEFERRED** — caller-supplied hash |
| 6   | Authentication providers                               | Wave exclusions      | **N/A** — platform auth             |
| 7   | Evidence-specific health / metrics / traces            | OES-ENG-091A PART-05 | **DEFERRED**                        |
| 8   | Evidence readiness on `GET /api/health`                | Ops gap              | **DEFERRED**                        |
| 9   | SIEM / security monitoring export                      | Ops                  | **DEFERRED**                        |
| 10  | `services/qep/services/qep-evidence/service.yaml` live | Stub                 | **DEFERRED**                        |
| 11  | Platform discovery of `modules/` root                  | Runtime config       | **DEFERRED**                        |
| 12  | Feature flag `APZHUB_QEP_EVIDENCE_*`                   | Ops nicety           | **DEFERRED**                        |
| 13  | Capability Certification                               | Owner                | **NOT AUTHORISED** under OPS-001    |
| 14  | Production Freeze / Release                            | Owner                | **NOT AUTHORISED** under OPS-001    |

## Known limitations (operator-facing)

1. Evidence data is **process-local** (memory).
2. No Evidence SQL rollback surface.
3. No dedicated Evidence health probe.
4. Package version remains **0.0.0** pending certification/version programme.
