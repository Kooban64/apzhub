# APZHUB APZ TCMS — GitHub Actions Adapter Architecture

**Milestone:** APZTCMS-016 — GitHub Actions Reference Adapter  
**Status:** Implemented (adapter-only; no Platform Service / Gateway / HTTP / UI)  
**Package:** `@apzhub/integration-github-actions` **0.1.0**  
**Authority:** [REFERENCE-ADAPTER-STANDARD](./REFERENCE-ADAPTER-STANDARD.md) · [ADR-0059](../adr/ADR-0059-apz-tcms-native-product-architecture.md) · APZTCMS-015 CI/CD contracts

---

## Purpose

First production **read-only** CI/CD reference adapter. GitHub Actions remains SoR for pipeline **execution**. APZ TCMS remains SoR for quality, certification, release governance, and traceability (via later platform integration).

---

## Architecture

```text
createGitHubActionsAdapter()
        ↓
GitHubActionsAdapter (IntegrationAdapterBase)
  ├── core (GitHubActionsCoreServices)
  ├── operations (diagnostics / health / compatibility)
  └── mappingRegistry (SDK Mapping Provider Framework)
        ↓
GitHubActionsOperationRunner
        ↓
GitHubActionsRestClient (package-private)
        ↓
SDK createHttpIntegrationClient → GitHub REST API
```

No Platform Service, Gateway, HTTP routes, Workbench UI, Event Bus, or persistence in this milestone.

---

## Package guides (source)

| Guide          | Path                                                                                                                             |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Adapter        | [`integrations/github-actions/docs/GITHUB-ACTIONS-ADAPTER.md`](../../integrations/github-actions/docs/GITHUB-ACTIONS-ADAPTER.md) |
| Mapping        | [`…/GITHUB-ACTIONS-MAPPING.md`](../../integrations/github-actions/docs/GITHUB-ACTIONS-MAPPING.md)                                |
| Compatibility  | [`…/GITHUB-ACTIONS-COMPATIBILITY.md`](../../integrations/github-actions/docs/GITHUB-ACTIONS-COMPATIBILITY.md)                    |
| Authentication | [`…/GITHUB-ACTIONS-AUTHENTICATION.md`](../../integrations/github-actions/docs/GITHUB-ACTIONS-AUTHENTICATION.md)                  |
| Developer      | [`…/GITHUB-ACTIONS-DEVELOPER.md`](../../integrations/github-actions/docs/GITHUB-ACTIONS-DEVELOPER.md)                            |

---

## Explicit exclusions

Workflow dispatch / rerun / cancel · binary artifact/log download · OAuth implementation · live GitHub App auth · Platform Services · Gateway · REST API · UI · Event Bus · notifications · realtime · AI · persistence.

---

## Related

[CI/CD Integration Architecture](./APZHUB-APZ-TCMS-CICD-Integration-Architecture.md) · [Provider Contract Guide](./APZHUB-APZ-TCMS-Provider-Contract-Guide.md) · [APZTCMS-016 Completion Report](../sprint/APZTCMS-016-completion-report.md)
