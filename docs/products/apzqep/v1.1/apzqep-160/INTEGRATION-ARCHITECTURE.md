# INTEGRATION-ARCHITECTURE

| Field     | Value                       |
| --------- | --------------------------- |
| Programme | APZQEP-160                  |
| Timestamp | 20260803T141613Z            |
| Stream    | B — Enterprise Integrations |

## Intent

Make APZQEP the quality control plane for developer platforms — GitHub, GitLab, Azure DevOps, Bitbucket — plus ALM (Plane/Jira) bi-directional traceability.

## Reference flow (GitHub / same for peers)

```text
Commit / PR event → Webhook → APZQEP Integration Service
  → Impact / suite selection → Automation Orchestrator
  → Playwright / k6 / A11y / … → Evidence
  → Quality score → PR check / merge gate (policy-driven)
```

## Integration principles

| Principle       | Rule                                                                   |
| --------------- | ---------------------------------------------------------------------- |
| Adapter pattern | One connector per external system; CE/self-hosted first                |
| Idempotency     | Webhooks and jobs at-least-once safe                                   |
| Policy gates    | Merge/block rules owned by APZQEP policy + Board-configured thresholds |
| Secrets         | Never in repo; connector config refs only                              |
| Neutrality      | Same orchestration model across SCM vendors                            |

## ALM

Plane / Jira: bi-directional links for requirements, defects, and verification evidence. User-facing names remain APZHUB terminology.

## Out of scope for this definition programme

Implementing webhooks, OAuth apps, or live SCM apps.
