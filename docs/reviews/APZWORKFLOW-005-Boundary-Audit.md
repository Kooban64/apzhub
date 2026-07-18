# APZWORKFLOW-005 — Boundary Audit

## Consolidated audits

| Audit             | Command                                 | Result |
| ----------------- | --------------------------------------- | ------ |
| Foundation        | `pnpm audit:workflow-foundation`        | PASS   |
| Platform Services | `pnpm audit:workflow-platform-services` | PASS   |
| HTTP + client     | `pnpm audit:workflow-http-client`       | PASS   |
| Workbench         | `pnpm audit:workflow-workbench`         | PASS   |
| Vertical          | `pnpm audit:workflow-vertical`          | PASS   |

## Vertical rules (summary)

- Complete dependency direction preserved
- No architectural shortcuts (UI→gateway, HTTP→core/persistence)
- No workflow execution code / n8n / Event Bus / queues / workers / schedulers
- No runtime credential resolution
- No designer / drag-and-drop
- Manifests route through Workbench framework; shell mounts `WorkflowsWorkspaceRouter`
- Execution remains explicitly unavailable in Workbench copy and diagnostics stubs

## Observations (not violations)

1. Testing product Next.js slug conflict may block Playwright `webServer` (external).
2. PostgreSQL live exercise may be limited in unit CI; in-memory parity + production factories certified.
3. Management-plane-only execution unavailability is intentional.
