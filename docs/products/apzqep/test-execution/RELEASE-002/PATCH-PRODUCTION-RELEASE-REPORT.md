# Patch Production Release Report — APZQEP-RELEASE-002

| Field           | Value                                                              |
| --------------- | ------------------------------------------------------------------ |
| Programme       | **APZQEP-RELEASE-002**                                             |
| Package         | `@apzhub/qep-test-execution` **1.0.1**                             |
| Prior Freeze    | FREEZE-002 **CLOSED** · RC **1.0.1-rc.1**                          |
| Certification   | CERT-002 **CLOSED** · **CERTIFIED_WITH_LIMITATIONS**               |
| Status          | **IMPLEMENTED / AWAITING OWNER PATCH PRODUCTION RELEASE DECISION** |
| Git tag (local) | `apzqep-test-execution-v1.0.1`                                     |
| Date            | 2026-07-29                                                         |
| Evidence        | `20260729T193042Z-APZQEP-RELEASE-002.json`                         |

## Activities

| Activity                             | Result                                    |
| ------------------------------------ | ----------------------------------------- |
| FREEZE-002 acceptance recorded       | ✅                                        |
| Version promotion 1.0.1-rc.1 → 1.0.1 | ✅ metadata/markers/docs only             |
| Repository commit of release tree    | ✅ Owner-authorised operational control   |
| Production patch tag                 | ✅ `apzqep-test-execution-v1.0.1` (local) |
| Release documentation                | ✅ this pack + `docs/releases/.../1.0.1/` |
| Unauthorised engineering             | ✅ NONE                                   |
| Deploy / npm publish                 | ❌ Not performed (correct)                |
| Unrestricted GA                      | ❌ Not approved                           |

## Availability

```text
LIMITED_AVAILABILITY_APPROVED
```

Security remediation completed and verified. Limited Availability remains pending operational browser readiness (L-OP-01).

## Recommendation to Owner

Accept Patch Production Release establishing **`@apzhub/qep-test-execution` 1.0.1** as the production patch baseline under **LIMITED_AVAILABILITY**. Future unrestricted GA via **APZQEP-GA-001** (planning only until authorised).
