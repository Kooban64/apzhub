# QX-P1-05 — Project membership attribute ACL

| Field       | Value                                                              |
| ----------- | ------------------------------------------------------------------ |
| Timestamp   | 20260808T054600Z                                                   |
| Disposition | **DEFER → Version 1.2**                                            |
| Residual    | PRODUCT-STATUS KI-002 / TD-002 / V11-002                           |
| Authority   | Owner Phase 2 closeout immediate action (Close \| Defer \| Reject) |

---

## Decision

**Deferred to Version 1.2** — with justification below.

This is not Closed and not Rejected. Cap fail-closed RBAC remains the V1.1 production security boundary. Project membership attribute refinement is an architectural enhancement beyond the Enterprise Quality Baseline Production Ready bar.

---

## Justification

1. **Board history** — KI-002 was accepted as an Architecture Observation residual at V1.0 GA (OPS-001), explicitly not a release blocker.
2. **Current control** — Cap APIs and shell navigation enforce PermissionService permissions (`qep.*.read` / `.operate`, etc.). Unauthorised callers receive 403; hydration already filters Cap nav (QX-P1-01 Closed).
3. **Scope of refinement** — True project-membership attribute ACL requires Identity / Cap authz design (membership attributes as first-class filters across Cap SoRs), not a residual patch. Cap `projectId` today is an attribute filter / scoping aid, not a complete membership ACL model.
4. **Production Ready risk** — Shipping a partial membership ACL in V1.1 would reopen architecture (out of scope for this closeout) and risk inconsistent isolation semantics.
5. **Intake** — Tracked as V11-002 for Version 1.2 planning; not authorised for V1.1 implementation.

---

## V1.1 acceptance posture

| Statement                                              | Status                       |
| ------------------------------------------------------ | ---------------------------- |
| Fail-closed Cap RBAC for Production Ready              | Satisfied (existing)         |
| Project membership attribute ACL as product capability | Deferred to V1.2             |
| Ambiguous residual on V1.1 inventory                   | **Cleared** (explicit Defer) |

---

## Follow-up (Version 1.2 only)

Design + implement project membership attribute ACL under Identity / Cap authz, with contract tests for cross-tenant and cross-project isolation. Requires Product Board authorisation of V11-002 (or successor).
