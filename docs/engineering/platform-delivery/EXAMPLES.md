# Examples

> **Programme:** APZHUB-ENGINEERING-001  
> Repository evidence of the Platform Delivery Standard applied.

---

## Analytics Platform (reference vertical)

Illustrative programme series (see repository packs for exact IDs and status):

| Phase                      | Example artefacts                                                    |
| -------------------------- | -------------------------------------------------------------------- |
| Commercial Planning        | `docs/products/apz-analytics/`                                       |
| Platform Foundation        | `docs/platform/analytics/` foundation docs + ADRs                    |
| Information Model          | Analytics IM / glossary under platform docs                          |
| Provider Integration       | Analytics provider integration under `integrations/` + certification |
| Contracts                  | `@apzhub/analytics-contracts`                                        |
| Platform Services          | `gateway.analytics.*`                                                |
| HTTP API                   | `/api/v1/analytics/*` + OpenAPI + `docs/http/analytics/`             |
| Workbench                  | `/workspace/analytics/*` + `docs/workbench/analytics/`               |
| Certification / Production | `docs/releases/analytics/` + APZ-ANALYTICS release programmes        |

**Lesson:** Commercial planning defined Release 1.0 and limitations before Workbench; certification was packaging-only.

---

## Workflow Platform (reference vertical)

| Phase               | Example artefacts                                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Platform programmes | `APZHUB-PLATFORM-WORKFLOW-00x` series                                                                                        |
| Contracts           | `@apzhub/workflow-contracts`                                                                                                 |
| Services            | `gateway.workflow.*`                                                                                                         |
| HTTP API            | `/api/v1/workflow/*` (canonical; distinct from `/api/v1/workflows` SoR) · `docs/http/workflow/`                              |
| Workbench           | `/workspace/workflow/*` (distinct from `/workspace/workflows` and `/workspace/workflow-engine`) · `docs/workbench/workflow/` |
| Commercial          | APZ Workflow planning + `APZ-WORKFLOW-002` Production Release evidence under `docs/releases/workflow/`                       |

**Lesson:** Path coexistence must be documented; Workbench must not call legacy SoR/engine routes when a canonical capability API exists.

---

## How to cite this standard in future programmes

Include in Owner Approval / programme README:

```text
This programme follows docs/engineering/platform-delivery/PLATFORM-DELIVERY-STANDARD.md
(APZHUB-ENGINEERING-001). Lifecycle phase: {PHASE}.
```

Do not recreate engineering instructions inside product programmes; link here instead.
