# APZHUB Operational Lifecycle Guide

**Milestone:** PRH-009  
**Audience:** Platform operators

---

## Purpose

Guide operators through platform lifecycle states, maintenance, graceful shutdown, and recovery using the canonical lifecycle manager.

---

## View lifecycle status

1. Open **Administration → Platform Operations → Dashboard**
2. Review **Lifecycle state** and **Maintenance mode** stat cards
3. Expand **Platform lifecycle**, **Readiness gates**, and **Capability lifecycle participation** panels

**API:** `GET /api/platform/v1/operations/lifecycle`

---

## Maintenance mode

Use when performing controlled platform work that should block normal operational classification.

```http
POST /api/platform/v1/operations/lifecycle
Content-Type: application/json

{ "action": "enter-maintenance" }
```

Exit when complete:

```json
{ "action": "exit-maintenance" }
```

---

## Graceful shutdown

1. `begin-shutdown` — enters `stopping` (draining)
2. `complete-shutdown` — enters `stopped`

Restart requires bootstrap recovery or `begin-recovery`.

---

## Recovery

When platform health is degraded:

1. Resolve root cause via Operations Control Plane (dependencies, capabilities)
2. `POST` with `{ "action": "begin-recovery" }`
3. Verify readiness gates return to satisfied
4. Confirm lifecycle state returns to `operational`

---

## Products

Products (Law Platform, Trust Accounting) report lifecycle participation but **do not own** platform lifecycle. Product degradation affects `products-ready` and `operational` gates but maintenance and shutdown are platform-owned.

---

## Related

- [Platform Lifecycle Architecture](../architecture/APZHUB-Platform-Lifecycle-Architecture.md)
- [Lifecycle State Machine](../architecture/APZHUB-Lifecycle-State-Machine.md)
- [Operational Readiness Guide](./APZHUB-Operational-Readiness-Guide.md)
