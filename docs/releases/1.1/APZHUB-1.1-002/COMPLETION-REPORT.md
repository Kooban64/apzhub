# APZHUB-1.1-002 — Completion Report

> **Programme:** APZHUB-1.1-002  
> **Title:** Release 1.1 — Law Operational Hardening (OBS-LAW-02)  
> **Classification:** ENGINEERING IMPLEMENTATION  
> **Status:** Complete — **Awaiting Acceptance**  
> **Date:** 2026-07-19  
> **Standard:** [Platform Delivery Standard](../../../engineering/platform-delivery/PLATFORM-DELIVERY-STANDARD.md)

---

## Prerequisites closed

| Prerequisite                        | Status                                                   |
| ----------------------------------- | -------------------------------------------------------- |
| APZHUB-1.1-001 (OBS-LAW-01)         | **ACCEPTED** (Owner Decision authorising this programme) |
| Platform 1.0.0 Production Baseline  | Held                                                     |
| Named Owner Approval for OBS-LAW-02 | This programme                                           |

---

## Delivered

### Code

1. **Platform ATF** — `PersistedActivitySessionStore` + `createLawActivityPersistenceStorageKey` (sync API; durable snapshot via storage backend; browser `localStorage` by default).
2. **Platform ENF** — `PersistedNotificationSessionStore` + `createLawNotificationPersistenceStorageKey` (same pattern; preserves read state).
3. **Law composition roots** — `createAppActivityTimelineContext` / `createAppEventNotificationContext` accept `persistenceScope` or explicit store injection.
4. **Law client shell** — `useAppEventNotificationContext` / `useAppActivityTimelineContext` pass user/tenant scope from session into durable stores.

### Tests

- Unit: persisted store restore across instances (ATF + ENF).
- Operational regression: Law context recreation retains notifications/activities for the same scope.

### Documentation

- Known Limitations: **KL-LAW-04 / OBS-LAW-02 removed** from active Law KLs (moved to resolved).
- Law operational readiness, release notes, feature catalogue, Owner Acceptance Register, AI-MANIFEST.
- This evidence pack under `docs/releases/1.1/APZHUB-1.1-002/`.

---

## Architecture honesty

Per LAW-012 §9–10: legal modules do **not** own parallel activity/notification subsystems. Persistence is **platform-owned** behind existing `ActivityService` / `NotificationService` injection points. Durable browser-backed session stores close the session-only UX residual. Multi-device PostgreSQL projection tables (`activity_projection` / `notification_inbox`) remain a future platform enhancement (not required to close OBS-LAW-02 session-only UX).

---

## Not delivered (explicit STOP)

| Item                                       | Status        |
| ------------------------------------------ | ------------- |
| FIN-001                                    | Not started   |
| Email SoR                                  | Not started   |
| Release 1.2 items                          | Not started   |
| Law / Workbench / Identity / HTTP redesign | Not performed |
| New legal functionality                    | Not performed |

---

## Residual Known Limitations (Law)

Placeholder UX · FIN-001 · No Email SoR · auth tenant claim honesty · other non-OBS-LAW-02 KLs — unchanged.

---

## Recommendation

# READY FOR OWNER ACCEPTANCE
