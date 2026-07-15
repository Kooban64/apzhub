# APZHUB Session Policy Guide (PRH-006)

## Production requirements

| Control | Required |
|---------|----------|
| Secure cookies | Yes |
| HttpOnly cookies | Yes |
| SameSite | lax |
| Dev registration | Disabled (`ALLOW_DEV_REGISTRATION=false`) |
| Dev tenant fallback | Blocked |
| Absolute session lifetime | 7 days |
| Idle refresh window | 1 day |

## Development behaviour

- Secure cookies relaxed for localhost
- Dev registration allowed when `ALLOW_DEV_REGISTRATION=true` and `NODE_ENV=development`
- Law API dev tenant fallback permitted unless `LAW_API_ALLOW_DEV_TENANT_FALLBACK=false`

## Environment validation

Production startup **fails** when `ALLOW_DEV_REGISTRATION=true` (PRH-006 / PRH-004 alignment).

Better Auth sign-up is disabled server-side when dev registration is not allowed.

## Diagnostics

`GET /api/platform/v1/security/diagnostics` → `security.session` and `security.session.sessionDiagnostics`.

## References

- [Session Security Architecture](../architecture/APZHUB-Session-Security-Architecture.md)
