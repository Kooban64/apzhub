# APZHUB-1.1-001 — Completion Report

> **Programme:** APZHUB-1.1-001  
> **Title:** Release 1.1 — Law Authorization Hardening (OBS-LAW-01)  
> **Classification:** ENGINEERING IMPLEMENTATION  
> **Status:** Complete — **Awaiting Acceptance**  
> **Date:** 2026-07-19  
> **Standard:** [Platform Delivery Standard](../../../engineering/platform-delivery/PLATFORM-DELIVERY-STANDARD.md)

---

## Prerequisites closed

| Prerequisite                              | Status                                                   |
| ----------------------------------------- | -------------------------------------------------------- |
| APZHUB-RELEASE-001 (Release 1.1 Planning) | **ACCEPTED** (Owner Decision authorising this programme) |
| Platform 1.0.0 Production Baseline        | Held                                                     |
| Named Owner Approval for OBS-LAW-01       | This programme                                           |

---

## Delivered

### Code

1. **`AuthWorkbenchPermissionAdapter.can()`** — honors `*` and namespace wildcards (e.g. `legal.*`) via local `workbenchPermissionPatternMatches` (aligned with `@apzhub/platform-authorization` without new package dependency).
2. **Law Platform hydration** (`apps/law-platform/lib/*-hydration.ts`) — `createWorkbenchPermissionAdapter({ mode: "auth", authContext })`; removed `allowDevRegistration` allow-all path on user-facing loaders.
3. **Law Platform shell** — `layout.tsx` resolves `createLawPlatformAuthPermissionContext(session)`; `WorkbenchProvider` receives `authPermissionContext` + `permissionMode="auth"`.
4. **Law API** (`apps/web/lib/api/auth/permission-resolver.ts`) — always `mode: "auth"`; removed empty-grant `["*"]` injection when `isDevRegistrationAllowed()`.

### Tests

- Workbench permission adapter unit tests (wildcard + exact).
- Law API auth tests: no `*` injection; `legal.*` pattern allow; 403 for non-granted keys outside default Law role set.

### Documentation

- Known Limitations: **KL-LAW-03 / OBS-LAW-01 removed** from active Law KLs (moved to resolved).
- Law operational readiness, release notes, architecture AuthZ notes, platform KL register, Owner Acceptance Register, AI-MANIFEST.
- This evidence pack under `docs/releases/1.1/APZHUB-1.1-001/`.

---

## Not delivered (explicit STOP)

| Item                                                       | Status        |
| ---------------------------------------------------------- | ------------- |
| OBS-LAW-02                                                 | Not started   |
| FIN-001                                                    | Not started   |
| Email SoR                                                  | Not started   |
| Release 1.2 items                                          | Not started   |
| Identity / Workbench / Legal Business Core / HTTP redesign | Not performed |

---

## Residual Known Limitations (Law)

Placeholder UX · OBS-LAW-02 · FIN-001 · No Email SoR · auth tenant claim honesty · other non-OBS-LAW-01 KLs — unchanged.

---

## Recommendation

# READY FOR OWNER ACCEPTANCE
