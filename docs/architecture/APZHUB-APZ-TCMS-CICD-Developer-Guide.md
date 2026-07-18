# APZHUB APZ TCMS — CI/CD Developer Guide

**Milestone:** APZTCMS-015

---

## Packages to touch

| Layer             | Package                              | Path                                                                           |
| ----------------- | ------------------------------------ | ------------------------------------------------------------------------------ |
| Contracts         | `@apzhub/testing-contracts`          | `src/domain/cicd-pipeline.ts`, `src/services/pipeline-service.ts`, permissions |
| Persistence       | `@apzhub/testing-persistence`        | `src/repositories/pipelines/`, migrations `0031`/`0032`                        |
| Domain            | `@apzhub/testing-services`           | `src/pipelines/`                                                               |
| Platform          | `@apzhub/platform-services`          | `src/services/testing/testing-pipelines-service-impl.ts`                       |
| Gateway contracts | `@apzhub/platform-service-contracts` | `testing-pipelines-service.ts`                                                 |

---

## Adding a provider adapter (future)

1. Implement `PipelineResultAdapter` for the reserved `PipelineProviderKind`.
2. Register in `createPipelineAdapterRegistry` / factory.
3. Add parse-only unit tests with fixture payloads — **no live network**.
4. Do not add HTTP clients, webhooks, or Event Bus publishers in the adapter.

Recommended first reference adapter: **GitHub Actions** under **APZTCMS-016** (await owner approval).

---

## Testing locally

```bash
pnpm --filter @apzhub/testing-contracts --filter @apzhub/testing-persistence --filter @apzhub/testing-services typecheck
pnpm vitest run packages/testing-services/src/pipelines \
  packages/testing-persistence/src/repositories/pipelines \
  packages/platform-services/src/services/testing/testing-pipelines
```

Coverage target for domain pipelines folder: **≥95%** lines.

---

## Architecture boundaries

- Modules/UI must not call adapters or persistence directly.
- Clients use `gateway.testing.pipelines` only (when HTTP exists in a later milestone).
- Release Governance may consume run summaries via `PipelineLinks.releaseId` — no auto-deploy.

---

## Related

[CI/CD Integration Architecture](./APZHUB-APZ-TCMS-CICD-Integration-Architecture.md) · [Provider Contract Guide](./APZHUB-APZ-TCMS-Provider-Contract-Guide.md) · [Pipeline Import Guide](./APZHUB-APZ-TCMS-Pipeline-Import-Guide.md)
