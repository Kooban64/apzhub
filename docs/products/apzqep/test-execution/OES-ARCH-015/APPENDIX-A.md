# APZQEP-OES-ARCH-015 — APPENDIX A — Glossary

| Term                        | Definition                                                      |
| --------------------------- | --------------------------------------------------------------- |
| TestExecution               | Aggregate root for one controlled performance of testing work   |
| ExecutionManifest           | Immutable sealed snapshot of source material and resolved steps |
| ExecutionStep               | Individual step within an execution                             |
| ExecutionContext            | Target/environment/build/configuration descriptors              |
| ExecutionAssignment         | Binding of owner, executor, reviewer, or agent                  |
| ExecutionOutcome            | Canonical result taxonomy value                                 |
| ExecutionObservation        | Non-defect fact or anomaly recorded during execution            |
| EvidenceReference           | Pointer + integrity metadata to evidence outside this SoR       |
| ExecutionReview             | Accept/reject decision record                                   |
| ExternalExecutionSubmission | Ingested automated/imported result package                      |
| availableActions            | Server-computed executable action list — sole UI authority      |
| Test Run                    | Future separate orchestration capability — not this aggregate   |
| Sealed                      | Manifest state that forbids mutation of source snapshot         |
| Fast-path accept            | Policy-allowed completion→accepted without review               |
| Supersession                | Replacement of an execution by a successor, preserving history  |
