# APZ TCMS — Module Registration Guide

**Milestone:** APZTCMS-002  
**Module ID:** `testing`  
**Status:** Manifest registered, module `status: disabled` / planned

---

## Manifest locations

| Artefact             | Path                                             |
| -------------------- | ------------------------------------------------ |
| Module               | `services/testing/manifests/testing/module.yaml` |
| TestingService       | `services/testing/service.yaml`                  |
| CertificationService | `services/certification/service.yaml`            |

Navigation is declared inside `module.yaml` (no separate `navigation.yaml` pattern required for this milestone).

---

## Declared sidebar routes (no pages yet)

| Sidebar ID               | Route                               |
| ------------------------ | ----------------------------------- |
| `testing.dashboard`      | `/workspace/testing`                |
| `testing.requirements`   | `/workspace/testing/requirements`   |
| `testing.plans`          | `/workspace/testing/plans`          |
| `testing.suites`         | `/workspace/testing/suites`         |
| `testing.cases`          | `/workspace/testing/cases`          |
| `testing.executions`     | `/workspace/testing/executions`     |
| `testing.automation`     | `/workspace/testing/automation`     |
| `testing.evidence`       | `/workspace/testing/evidence`       |
| `testing.certification`  | `/workspace/testing/certification`  |
| `testing.reports`        | `/workspace/testing/reports`        |
| `testing.administration` | `/workspace/testing/administration` |

Do **not** create `apps/web` routes or components in APZTCMS-002.

---

## Discovery rules (025)

- Never hardcode the Testing module in the shell
- Register via Module Registry / manifest discovery only
- Module depends on `testing-service` and `certification-service`
- Activity Bar permission: `testing.view`

---

## Enabling later

Flip module status and ship UI only after owner-approved milestones that include workbench views. Keep engine branding hidden.
