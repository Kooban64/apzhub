# SCM Architecture — APZQEP-162

## Principle

APZQEP-162 delivers an **Enterprise Source Control Platform**, not a GitHub integration.

```text
SCM Platform
      │
      ├── SCM Provider Interface
      │         │
      │         ├── GitHub Provider          (active — Wave 2)
      │         ├── GitLab Provider          (placeholder)
      │         ├── Azure DevOps Provider    (placeholder)
      │         ├── Bitbucket Provider       (placeholder)
      │         ├── Gitea Provider           (placeholder)
      │         └── Forgejo Provider         (placeholder)
      │
      ├── Provider Registry
      ├── Repository Registry
      ├── Webhook Dispatcher
      ├── Event Router
      └── Traceability hooks → Evidence / QKI / Automation / Reporting
```

## Peer platform packages

| Package                       | Role                                  |
| ----------------------------- | ------------------------------------- |
| `@apzhub/platform-automation` | Wave 1 — Automation Platform          |
| `@apzhub/platform-scm`        | Wave 2 — Source Control Platform      |
| (future) `platform-ci`        | CI orchestration (not this programme) |
| (future) `platform-ai`        | AI Quality Intelligence (Wave 3)      |

APZQEP consumes these packages; it does not embed provider-specific logic in the product core.

## Package placement

| Package                | Role                                                      |
| ---------------------- | --------------------------------------------------------- |
| `@apzhub/platform-scm` | **Platform** capability — reusable across APZHUB products |
| `@apzhub/qep-scm`      | APZQEP consumer facade + workspace presentation contracts |
| `apps/web`             | Provider-neutral HTTP API + SCM Workspace UI              |
| `modules/qep-scm`      | Module manifest (M19 enabled)                             |

## Layer rules

1. **SCM Engine never imports GitHub SDK/types into its public surface** — only the GitHub provider module may call `api.github.com`.
2. **External APIs are provider-neutral** — no GitHub webhook field names on product API contracts.
3. **Modules call the QEP facade / platform engine** — UI never talks to providers.
4. **Evidence / QKI / Notifications / Automation / Reporting** integrate via events and relationship hooks — not duplicated.
5. Placeholders refuse connect/register until a future wave implements them.

## Request path

```text
Client → Gateway → Auth → Authz → QEP SCM API → QepScmFacade
  → ScmEngine → ScmProvider Interface → GitHub Provider → (optional) GitHub API
  → Domain Events → Automation / Evidence / QKI / Notifications hooks
```

## Offline-first default

`APZHUB_SCM_GITHUB_LIVE` defaults unset/false. CI and demos use offline GitHub provider behaviour without calling `api.github.com`. Set live + PAT only for ops validation.
