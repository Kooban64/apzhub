# APZHUB APZ TCMS — Provider Contract Guide

**Milestone:** APZTCMS-015  
**Interface:** `PipelineResultAdapter` in `@apzhub/testing-contracts`

---

## Adapter contract (parse-only)

Every provider adapter implements:

```ts
interface PipelineResultAdapter {
  readonly kind: PipelineProviderKind;
  readonly version: string;
  canParse(input: unknown): boolean;
  parse(input: unknown): CanonicalPipelineResult;
}
```

**Rules:**

- Never call live CI provider APIs.
- Never trigger, cancel, or retry pipelines.
- Never download artifacts or log bodies.
- Emit only canonical `PipelineResult` / `CanonicalPipelineResult`.
- Provider-specific quirks stay inside the adapter; domain services see canonical shapes only.

---

## Read-oriented capabilities (conceptual)

Vendor-neutral capability surface (metadata retrieval semantics — not HTTP):

| Capability | Notes |
| ---------- | ----- |
| list / get pipelines | Via registered Pipeline SoR |
| list / get runs | Via imported PipelineRun SoR |
| list stages / jobs | Derived from stored run JSON |
| retrieve artifacts metadata | ArtifactReference only |
| retrieve logs metadata | PipelineLogReference only |
| retrieve approvals / environments / variables | Metadata only |
| retrieve execution summary | PipelineSummary / metrics |

**No execution** of any capability that would mutate an external CI system.

---

## Registry

`PipelineAdapterRegistry` registers adapters by `PipelineProviderKind`, resolves by kind or `canParse`, and lists providers for `pipeline.providers` gated callers.

---

## Generic CI (APZTCMS-015)

- Kind: `generic_ci`
- Accepts JSON object (or JSON string) with vendor-neutral field aliases
- Normalizes status aliases (`success` → `passed`, etc.)
- Implemented in `packages/testing-services/src/pipelines/adapters/generic-ci-adapter.ts`

---

## Future adapters

| Kind | Milestone |
| ---- | --------- |
| `github_actions` | **APZTCMS-016** (recommended next; not started) |
| `gitlab_ci` / `azure_devops` / `jenkins` / `circleci` / `buildkite` | Future |

Kinds are reserved in schema CHECK constraints so future adapters can persist without migration churn.

---

## Related

[Canonical Pipeline Model](./APZHUB-APZ-TCMS-Canonical-Pipeline-Model.md) · [Pipeline Import Guide](./APZHUB-APZ-TCMS-Pipeline-Import-Guide.md)
