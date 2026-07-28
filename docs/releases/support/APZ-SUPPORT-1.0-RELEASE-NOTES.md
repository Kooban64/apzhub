# APZ Support 1.0.0 — Release Notes

> **Product version:** APZ Support **1.0.0**  
> **Classification:** PRODUCTION BASELINE PACKAGING (documentation only)  
> **Engineering baseline:** OSS-110-12 (vertical) · OSS-110-13 (UI) · OSS-110-14 (UI certification)  
> **Packaging programme:** APZHUB-RELEASES-001  
> **Date:** 2026-07-19  
> **Status:** Current Production SemVer — packaging filed; Owner Acceptance via APZHUB-RELEASES-001  
> **Evidence archive:** [1.0.0/](./1.0.0/README.md)

---

## Summary

APZ Support is already **Production** (certified with limitations). This release record assigns SemVer **1.0.0** to the Owner-accepted Support Workbench and vertical delivered under OSS-110-12/14. **No production code, package, or architecture changes** are introduced by this packaging.

---

## Delivered (prior engineering — packaged as 1.0.0)

| Area              | Outcome                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| Workbench         | Support Activity Bar · inbox/detail/create · conversation · notes vs replies · search · analytics |
| Platform HTTP     | `/api/v1/support-*` via PlatformServiceGateway only                                               |
| Platform Services | Support* services · mapping · Zammad providers                                                    |
| Integration       | `@apzhub/integration-zammad` **0.6.0** — CERTIFIED_WITH_LIMITATIONS                               |
| Certification     | Vertical CERTIFIED_WITH_LIMITATIONS · UI **PRODUCTION_READY_WITH_LIMITATIONS**                    |

---

## Compatibility

| Component                        | Version / state                                     |
| -------------------------------- | --------------------------------------------------- |
| `@apzhub/integration-zammad`     | **0.6.0** — unchanged by packaging                  |
| `@apzhub/integration-sdk`        | **1.0.0** — frozen, unchanged                       |
| Platform Support HTTP / services | Consumed as certified — not redesigned by packaging |
| Repository quality               | QA-002 **PRODUCTION READY** retained                |

See [APZ-SUPPORT-1.0-COMPATIBILITY.md](./APZ-SUPPORT-1.0-COMPATIBILITY.md).

---

## Residual limitations

Documented in [KNOWN-LIMITATIONS.md](../../products/support/KNOWN-LIMITATIONS.md). Notably: no Zammad webhook ingress, no binary attachments, no realtime WS/SSE. Event Bus publish + in-app ENF notifications closed under [APZHUB-1.1-003](../1.1/APZHUB-1.1-003/README.md) (Awaiting Acceptance).

---

## Evidence

- [Completion Report](../../sprint/APZ-SUPPORT-1.0-completion-report.md)
- [Acceptance Report](../../foundation/completion-reports/APZ-SUPPORT-1.0-release-acceptance-report.md)
- [Quality Evidence](./APZ-SUPPORT-1.0-QUALITY-EVIDENCE.md)
- Engineering: [OSS-110-12](../../sprint/OSS-110-12-completion-report.md) · [OSS-110-14](../../sprint/OSS-110-14-completion-report.md)

---

## Out of scope

- Release **2.0** implementation (planning only — separate Approval required)
- Greenfield rebuild of ticket Workbench
- Documents, Analytics, or other products
