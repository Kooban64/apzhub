# Platform Admin — Governance Control Plane

| Field    | Value                                |
| -------- | ------------------------------------ |
| Status   | **ACCEPTED** (Owner)                 |
| Surfaces | Identity & Access · Security · Audit |

## Separation

```text
IDENTITY & ACCESS   → WHO has authority?
SECURITY            → IS access/security behaving safely?
AUDIT               → WHAT actually happened?
```

Do not blend into one security dashboard.

## Honesty rules

- Platform administrators = platform-scope control-plane role assignments only.
- Never list a user merely because they are an APZOR / org administrator.
- Platform roles map to the real AuthZ catalogue — no invented Owner / Operations rows.
- Privileged Access / Access Reviews / Tenant Access / Exports → **Not configured** when durable stores do not exist.
- MFA coverage, failed sign-ins, security event counts → Unavailable / Not configured — never fabricated.
- No security score.
- Audit uses the **APE-Audit** facade only — no parallel audit warehouse.
- Session revoke reuses BetterAuth session delete when the session belongs to the user.

## Tenant data boundary

```text
Platform Administrator  ≠  automatic tenant business-data access
```

Role detail always shows **Tenant Business Data → No implied access**.

## Deferred (intentionally not built)

- Custom-role designer
- Access-request / access-review workflows
- Privileged-access approval write path
- New SIEM / security-policy engine
- Audit warehouse / export pipeline

## Routes

| Surface           | Path                              |
| ----------------- | --------------------------------- |
| Identity & Access | `/platform-admin/identity-access` |
| Security          | `/platform-admin/security`        |
| Audit             | `/platform-admin/audit`           |

## Next

Billing is the final major Platform Admin domain, then a single end-to-end visual/capability pass.
