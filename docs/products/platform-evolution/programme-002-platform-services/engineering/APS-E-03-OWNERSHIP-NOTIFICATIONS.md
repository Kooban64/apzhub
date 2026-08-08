# APS-E-03 — Ownership hygiene: Notifications

| Field     | Value                                                     |
| --------- | --------------------------------------------------------- |
| Status    | **COMPLETE** (rationalise — not rewrite)                  |
| Timestamp | 20260808T233500Z                                          |
| Canonical | **APS-Notifications** (APS-S-02)                          |
| Packages  | `@apzhub/event-notification-framework` · `notification-*` |

---

## Finding

| Artifact                                            | Classification                                                            |
| --------------------------------------------------- | ------------------------------------------------------------------------- |
| ENF + `notification-*` + `/api/v1/notifications/**` | **Canonical Platform Service**                                            |
| `@apzhub/qep-notification`                          | **Product-local QEP notification/subscription stack** — ownership anomaly |
| Notification inbox routes                           | **APS-Notifications surface** — not a separate Universal Inbox            |
| Support work-queue inbox                            | **Product capability** (APZ Support)                                      |

---

## Rationalisation (no UX break)

1. **Canonical owner** of cross-product notifications is APS-Notifications only.
2. `@apzhub/qep-notification` is **reclassified** as QEP product machinery that must not be presented as a platform service.
3. New cross-product notification behaviour **must** use APS-Notifications / ENF contracts.
4. Full package merge/deletion is **deferred** to a later ownership slice only if it can be done without QEP UX/API breakage — out of Programme 002 rewrite scope.
5. Candidate Law 7 watch: one canonical notification contract (ENF / notification-contracts) — QEP types are product-local until converged.

---

## RC1 evidence contribution

- Clear owner: APS-Notifications
- Two-Consumer Rule: satisfied (multi-product + Constitution)
- No product redesign
- Anomaly named and bounded (not invented as second Platform Service)
