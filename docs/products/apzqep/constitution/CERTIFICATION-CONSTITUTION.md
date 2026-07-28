# APZ QEP — Certification Constitution

> **Programme:** APZQEP-CONSTITUTION-001  
> **Authority:** Constitutional (Article VI)

## Immutable certification principles

| #   | Principle                                                                                                                                |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Certification requires human accountability** — a responsible human actor (or multi-role human approval chain) must approve or reject. |
| 2   | **AI never certifies independently** — AI may recommend; humans decide.                                                                  |
| 3   | **Certification evidence is immutable once approved** — approved evidence packs are not silently rewritten.                              |
| 4   | **Certification history is never deleted** — retention and legal hold may archive; history is not erased for convenience.                |
| 5   | **Every certification is reproducible** — enough metadata and evidence references exist to reconstruct what was certified and why.       |
| 6   | **Every certification is traceable** — to requirements, verifications, evidence, actors, timestamps, and decisions.                      |
| 7   | **Certification state changes are audited** — immutable audit via Platform Audit patterns.                                               |
| 8   | **Rejection is first-class** — reject reasons are recorded; not only approvals.                                                          |
| 9   | **Continuous certification signals never auto-flip certified state** — signals may request re-cert; humans re-approve.                   |
| 10  | **Certification before Release** — release confidence depends on certification posture, not informal opinion.                            |

## Definitions (constitutional)

| Term                   | Meaning                                                        |
| ---------------------- | -------------------------------------------------------------- |
| Certification decision | Explicit human approve/reject of a certification package/scope |
| Evidence pack          | Set of evidence refs + metadata supporting a decision          |
| Re-certification       | New human decision after material change or signal             |

## Non-negotiable product behaviours

- No hidden “auto-certify on green pipeline” path
- No MCP/agent tool that certifies without human UI/API approval flow
- No backdating of certification actors or timestamps

## Relationship to evidence

Evidence may be appended under controlled rules for new runs; **approved certification packages** remain historically intact. Corrections use new decisions, not silent mutation of history.
