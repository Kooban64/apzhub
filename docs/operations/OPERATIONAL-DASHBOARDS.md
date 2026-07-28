# APZHUB Operational Dashboards

> **Programme:** APZHUB-OPERATIONS-001  
> **Date:** 2026-07-20  
> **STOP:** This programme does **not** implement dashboards.

---

## Target dashboard set (governance)

| Dashboard          | Audience        | Contents                                  |
| ------------------ | --------------- | ----------------------------------------- |
| Platform Health    | Ops             | Hierarchy greens/reds; gateway; DB; Redis |
| Incidents          | Ops Lead        | Open P1–P3; MTTA/MTTR                     |
| Change / Release   | Release Manager | Windows; success rate                     |
| AuthZ / Security   | SecOps          | Denials; superadmin actions               |
| Event / Automation | Platform eng    | Publish failures; deferred triggers; DLQ  |
| Product paths      | Service Owners  | Per-product API error rates               |
| Capacity           | Ops             | Disk, CPU, connections                    |

## Rules

1. Dashboards are **ops-gated** — not end-user product UIs.
2. Mask engine branding.
3. Prefer platform health APIs over deep-linking engine admin consoles for standard operators.
4. Legacy Grafana host (`apzobservability…` per ENVIRONMENT.md) may exist — classify as infra until APZHUB Observe connectors are Owner-authorised for Production ops use.

## Implementation path

Dashboard implementation requires a **named engineering / observability programme** after this framework Acceptance — see [OPERATIONS-ROADMAP.md](./OPERATIONS-ROADMAP.md).
