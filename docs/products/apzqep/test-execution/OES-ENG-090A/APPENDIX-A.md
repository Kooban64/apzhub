# APZQEP-OES-ENG-090A — APPENDIX A — Glossary

| Term                            | Definition                                                        |
| ------------------------------- | ----------------------------------------------------------------- |
| **TestExecution**               | Aggregate root; SoR for a controlled performance of testing work  |
| **ExecutionManifest**           | Sealed snapshot of sources and steps; immutable after seal        |
| **ExecutionStep**               | Ordered step record with expected/actual/outcome                  |
| **ExecutionOutcome**            | Canonical step or execution-level result taxonomy                 |
| **ExecutionContext**            | Extensible descriptors for target environment/config              |
| **ExecutionAssignment**         | Owner / executor / reviewer / agent binding                       |
| **EvidenceReference**           | Pointer + integrity metadata to external evidence; not a blob     |
| **ExecutionObservation**        | Non-defect factual note recorded during execution                 |
| **ExecutionReview**             | Authorised accept/reject decision with audit                      |
| **ExternalExecutionSubmission** | Ingested automated/external result under trust boundary           |
| **availableActions**            | Server-computed list of executable actions; sole UI authority     |
| **Test Run**                    | Future orchestration capability — **not** TestExecution           |
| **Fast-path accept**            | Policy-allowed `completed → accepted` without review queue        |
| **Supersession**                | Lineage replacement of an execution by a successor                |
| **Frozen baseline**             | Certified/frozen QEP capability package at 1.0.0 — reference only |
| **OES**                         | Owner Engineering Specification (this programme type)             |

Architecture glossary in ARCH-015 Appendix A remains complementary; on conflict, ARCH-015 wins for meaning, this OES for engineering application.
