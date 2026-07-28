# Frozen Capability Register — APZQEP-PORTFOLIO-001

Consolidated, authoritative register of the five capabilities comprising the First Capability Wave. All five are **1.0.0 CERTIFIED / FROZEN**. Cited from each capability's own certification and freeze packs — no claim here is invented.

| Capability          | Package                           | Version   | Status     | Freeze evidence                                                                                                                                                                                                                          |
| ------------------- | --------------------------------- | --------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Requirements        | `@apzhub/qep-requirements`        | **1.0.0** | **FROZEN** | Certified & frozen under **APZQEP-REQ-001** (2026-07-26) — [requirements/capability-certification/](../../requirements/capability-certification/README.md)                                                                               |
| Traceability        | `@apzhub/qep-traceability`        | **1.0.0** | **FROZEN** | Certified & frozen under **APZQEP-TRACE-001** (2026-07-26) — [traceability/capability-certification/](../../traceability/capability-certification/README.md)                                                                             |
| Verification        | `@apzhub/qep-verification`        | **1.0.0** | **FROZEN** | Certified & frozen under **APZQEP-CERT-040D** (2026-07-26) — [verification/capability-certification/](../../verification/capability-certification/README.md)                                                                             |
| Test Specifications | `@apzhub/qep-test-specifications` | **1.0.0** | **FROZEN** | Certified under **APZQEP-CERT-050D**; frozen under separate Owner Freeze Decision — evidence `20260727T095000Z-APZQEP-TEST-SPECIFICATIONS-1.0.0-FREEZE.json` — [test-specifications/freeze/](../../test-specifications/freeze/README.md) |
| Test Plans          | `@apzhub/qep-test-plans`          | **1.0.0** | **FROZEN** | Certified under **APZQEP-CERT-080A**; frozen under **APZQEP-FREEZE-080A** — evidence `20260728T092059Z-APZQEP-TEST-PLANS-1.0.0-FREEZE.json` — [test-plans/freeze/](../../test-plans/freeze/README.md)                                    |

```text
Requirements         1.0.0  FROZEN
Traceability         1.0.0  FROZEN
Verification         1.0.0  FROZEN
Test Specifications  1.0.0  FROZEN
Test Plans           1.0.0  FROZEN
```

## Freeze pattern by capability

| Capability          | Freeze mechanism                                                                                                                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Requirements        | Certification and Freeze recorded together under a single programme identifier (**APZQEP-REQ-001**)                                                                                                                       |
| Traceability        | Certification and Freeze recorded together under a single programme identifier (**APZQEP-TRACE-001**)                                                                                                                     |
| Verification        | Certification and Freeze recorded together under a single programme identifier (**APZQEP-CERT-040D**)                                                                                                                     |
| Test Specifications | Certification (**CERT-050D**) followed by a **separate** Owner Freeze Decision                                                                                                                                            |
| Test Plans          | Certification (**CERT-080A**) followed by a **separate** Owner Freeze Decision (**FREEZE-080A**) — the pattern later formalised as [OES-CERTIFICATION-LEVELS.md](../../../../engineering/oes/OES-CERTIFICATION-LEVELS.md) |

The two mechanisms are not a defect — Test Specifications and Test Plans established the precedent (Certification and Freeze as genuinely separate Owner Decisions) which is now the recommended pattern for future capabilities.

## Change control

Future changes to any of the five packages above require formal change control and semantic versioning under a **new**, Owner-authorised programme. This register does not itself authorise any change.

## STOP

```text
FIVE CAPABILITIES
1.0.0 CERTIFIED / FROZEN
NO CHANGES WITHOUT A NEW OWNER-AUTHORISED PROGRAMME
```
