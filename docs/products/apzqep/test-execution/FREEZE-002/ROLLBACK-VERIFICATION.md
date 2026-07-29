# Rollback Verification — APZQEP-FREEZE-002

## Target rollback baseline

```text
@apzhub/qep-test-execution 1.0.0
tag: apzqep-test-execution-v1.0.0
```

## Procedure (summary)

1. Redeploy / restore workspace package identity to **1.0.0** from the production tag.
2. Ensure gateway bootstrap matches 1.0.0 behaviour for that revision (evidence check wiring may differ — expect pre-remediation EvidenceAccessPort behaviour on that baseline).
3. Confirm Limited Availability controls remain appropriate for 1.0.0 (L-02 was open on that baseline).
4. Do not leave mixed 1.0.1-rc.1 application code against 1.0.0 markers.

## Verification

| Check                                        | Result                                      |
| -------------------------------------------- | ------------------------------------------- |
| 1.0.0 tag exists locally                     | ✅ `apzqep-test-execution-v1.0.0`           |
| Rollback guide present                       | ✅ This document + FREEZE-001 lineage       |
| Schema migration rollback required for L-02? | ✅ **No** — remediation is code/policy only |
| Data loss risk                               | Low for evidence references already stored  |

## Verdict

```text
ROLLBACK READY TO 1.0.0
```
