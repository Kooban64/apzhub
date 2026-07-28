# APZHUB Performance Management

> **Programme:** APZHUB-OPERATIONS-001  
> **Date:** 2026-07-20

---

## Objectives

Maintain acceptable interactive latency for Workbench and Law Platform under certified Production load, without claiming uncertified realtime/execute paths.

## Performance focus areas

| Area                       | Expectation                                              |
| -------------------------- | -------------------------------------------------------- |
| Gateway auth path          | Fast AuthN/AuthZ; no frontend-only security              |
| Platform Service mutations | Respond fast; async via Event Bus (Document **012**)     |
| Search                     | Permission-filtered query time; index freshness eventual |
| Support / Projects lists   | Adapter latency dominated — monitor connector health     |
| Automation / Attention     | Fail-soft; must not block mutations                      |

## Management loop

```text
Measure → Compare to KPI → Diagnose (app vs engine vs host) → Change/Problem → Verify
```

## Anti-patterns

- Long-running work in request handlers
- Module→Module HTTP “optimisations”
- Disabling AuthZ for speed
- Unauthorised caching of authoritative engine SoR in platform DB
