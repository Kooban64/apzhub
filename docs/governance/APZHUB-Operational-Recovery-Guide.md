# APZHUB Operational Recovery Guide

**Milestone:** PRH-010  
**Audience:** Platform operators

---

## When to recover

Initiate recovery when:

- Lifecycle state is `degraded`
- Production verification is `NOT_READY`
- Dependency health shows database or Redis failure
- Operator has resolved the root cause

---

## Recovery workflow

1. Open **Platform Operations → Dashboard**
2. Identify failing readiness gates and dependency health
3. Resolve infrastructure root cause (database, Redis, configuration)
4. `POST /api/platform/v1/operations/lifecycle` with `{ "action": "begin-recovery" }`
5. Verify lifecycle returns to `operational`
6. Confirm production verification improves

---

## Failure-specific guidance

| Failure | Operator action |
|---------|-----------------|
| Database unavailable | Restore PostgreSQL; verify migrations; re-check readiness |
| Redis unavailable | Restore Redis; expect rate-limit/session cache degradation until healthy |
| Configuration invalid | Fix environment variables; restart process if required |
| Bootstrap failure | Review runtime bootstrap logs and manifest discovery |
| Authorization missing | Verify platform authorization service initialization |
| Product unavailable | Restore product diagnostics after platform core is healthy |

Recovery guidance is also available via `@apzhub/platform-security` `buildRecoveryGuidance()`.

---

## Graceful shutdown

1. `begin-shutdown` — drain lifecycle to `stopping`
2. `complete-shutdown` — mark `stopped`
3. Restart application process
4. `begin-recovery` or allow bootstrap to advance gates automatically

---

## Maintenance

Use maintenance mode for controlled work without implying dependency failure:

```json
{ "action": "enter-maintenance" }
```

Exit when complete:

```json
{ "action": "exit-maintenance" }
```

---

## Related

- [Operational Lifecycle Guide](./APZHUB-Operational-Lifecycle-Guide.md)
- [Failure Injection Guide](./APZHUB-Failure-Injection-Guide.md)
- [Operations Dashboard Guide](../developer/APZHUB-Operations-Dashboard-Guide.md)
