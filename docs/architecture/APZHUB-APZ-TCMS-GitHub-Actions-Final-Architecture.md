# APZHUB APZ TCMS — GitHub Actions Final Architecture

**Milestone:** APZTCMS-020 — Wave Certification & Reference Adapter Closeout  
**Status:** Frozen reference architecture  
**Package:** `@apzhub/integration-github-actions` **0.1.0**  
**Authority:** [CI/CD Reference Adapter Standard](./APZHUB-CICD-Reference-Adapter-Standard.md)

---

## End-to-end stack

```text
Workbench (Pipelines section)
  → createHttpPipelineClient()
    → /api/v1/testing/pipelines (18 routes)
      → gateway.testing.{pipelines|pipelineRepositories|…}
        → RequestPipeline + pipeline.* authorization
          → Platform Services (SoR + live)
            → ProviderResolver → GitHub*Provider
              → GitHubActionsAdapter.core
                → Integration SDK HTTP + Mapping
                  → Canonical CI/CD models (testing-contracts)
```

## Frozen decisions

1. External CI is SoR for **execution**; APZ TCMS is SoR for **quality/governance/imported metadata**.
2. Read-only metadata integration for GitHub Actions wave.
3. Plane/Zammad-compatible adapter lifecycle + ops health model.
4. ProviderRegistry for live browse; domain `PipelineAdapterRegistry` for parse/import.
5. Presentation never bypasses gateway.

## Related

[GitHub Actions Certification](./APZHUB-APZ-TCMS-GitHub-Actions-Certification.md) · [Capability Matrix](./APZHUB-APZ-TCMS-GitHub-Actions-Capability-Matrix.md) · [Vertical Certification (019)](./APZHUB-APZ-TCMS-GitHub-Vertical-Certification.md)
