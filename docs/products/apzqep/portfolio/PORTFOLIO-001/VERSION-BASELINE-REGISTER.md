# Version Baseline Register — APZQEP-PORTFOLIO-001

Consolidated register of package versions at the close of the First Capability Wave. All five packages are at **1.0.0**, **CERTIFIED / FROZEN**. This register does not promote, bump, or otherwise change any version — it records what is already true in each capability's own Version Promotion / Freeze pack.

| Package                           | Version   | Class                             | Promotion record                                                                                                                                                                        |
| --------------------------------- | --------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@apzhub/qep-requirements`        | **1.0.0** | PRODUCTION_READY_WITH_LIMITATIONS | Promoted and frozen under **APZQEP-REQ-001**                                                                                                                                            |
| `@apzhub/qep-traceability`        | **1.0.0** | PRODUCTION_READY_WITH_LIMITATIONS | Promoted and frozen under **APZQEP-TRACE-001**                                                                                                                                          |
| `@apzhub/qep-verification`        | **1.0.0** | PRODUCTION_READY_WITH_LIMITATIONS | Promoted and frozen under **APZQEP-CERT-040D**                                                                                                                                          |
| `@apzhub/qep-test-specifications` | **1.0.0** | PRODUCTION_READY_WITH_LIMITATIONS | Promoted under **APZQEP-CERT-050D**; frozen under separate Owner Freeze Decision                                                                                                        |
| `@apzhub/qep-test-plans`          | **1.0.0** | PRODUCTION_READY_WITH_LIMITATIONS | Promoted **0.2.0 → 1.0.0** under **APZQEP-CERT-080A** (see [VERSION-PROMOTION.md](../../test-plans/capability-certification/VERSION-PROMOTION.md)); frozen under **APZQEP-FREEZE-080A** |

```text
@apzhub/qep-requirements          1.0.0  CERTIFIED  FROZEN
@apzhub/qep-traceability          1.0.0  CERTIFIED  FROZEN
@apzhub/qep-verification          1.0.0  CERTIFIED  FROZEN
@apzhub/qep-test-specifications   1.0.0  CERTIFIED  FROZEN
@apzhub/qep-test-plans            1.0.0  CERTIFIED  FROZEN
```

## Test Plans component-level version history (the only capability delivered with intermediate component versions)

| Stage                              | Version           | Label                                     |
| ---------------------------------- | ----------------- | ----------------------------------------- |
| Domain component-certified         | 0.1.0             | DOMAIN CERTIFIED                          |
| Infrastructure component-certified | 0.2.0             | INFRASTRUCTURE COMPONENT CERTIFIED        |
| Workbench component-certified      | 0.2.0 (unchanged) | WORKBENCH COMPONENT CERTIFIED             |
| Capability-certified               | **1.0.0**         | CERTIFIED                                 |
| Frozen                             | **1.0.0**         | CERTIFIED / FROZEN / BASELINE ESTABLISHED |

## SemVer discipline going forward

Per each capability's freeze record: only the **1.0.x** patch line is available for any package above, and only under a new, separate Owner-authorised programme. Minor (**1.1.0**) or major (**2.0.0**) changes require full change control and re-entry through the APZOR lifecycle. This register does not itself authorise any patch, minor, or major change.

## STOP

```text
FIVE PACKAGES
ALL 1.0.0
ALL CERTIFIED / FROZEN
NO VERSION CHANGE MADE BY THIS PROGRAMME
```
