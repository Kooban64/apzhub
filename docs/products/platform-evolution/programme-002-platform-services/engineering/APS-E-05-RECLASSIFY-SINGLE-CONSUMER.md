# APS-E-05 — Reclassify single-consumer `platform-*` packages

| Field     | Value                     |
| --------- | ------------------------- |
| Status    | **COMPLETE**              |
| Timestamp | 20260808T233500Z          |
| Rule      | Two-Consumer Rule · Law 6 |

---

## Disposition

These packages are **not** Programme 002 Platform Services. Naming must not imply APS inventory membership.

| Package                                               | Reclassified as                              | Evidence                                                    |
| ----------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------- |
| `@apzhub/platform-automation`                         | **QEP-elevated product engine**              | Primary consumers under `apps/web/lib/qep/*` / QEP handlers |
| `@apzhub/platform-orchestration`                      | **QEP-elevated product engine**              | QEP quality flows / orchestration runtime                   |
| `@apzhub/platform-scm`                                | **QEP-elevated product engine**              | QEP SCM handlers                                            |
| `@apzhub/platform-quality-intelligence`               | **QEP-elevated product engine**              | QEP QI handlers                                             |
| `@apzhub/platform-dashboard`                          | **QEP-elevated product engine**              | QEP dashboards                                              |
| `@apzhub/platform-visualization`                      | **QEP-elevated product engine**              | QEP visualization surfaces                                  |
| TCMS `platform-quality` / `platform-release` services | **Testing / certification product services** | Domain is TCMS, not portfolio UX                            |

---

## Promotion path (future only)

A package may re-enter APS inventory consideration only if:

1. A second Production Ready product genuinely consumes it, **and**
2. Owner Accept amends APS-002 (finite inventory change), **and**
3. Constitution / Two-Consumer Rule still hold.

Until then: **product-owned**, even if the npm name says `platform-`.

---

## RC1 evidence contribution

- Platform inventory remains seven
- Law 6 respected (platform stayed smaller)
- No silent promotion by rename
