# APZTCMS-020 — Dependency Audit

**Date:** 2026-07-12  
**Verdict:** **PASS** — zero reverse dependencies

---

## Required direction

```text
Workbench → Typed Client → HTTP → Gateway → Platform Services
  → Provider → Adapter → SDK → Transport
  → Canonical Models (testing-contracts)
```

## Evidence

Automated import scan (APZTCMS-020): **VIOLATIONS=0** against forbidden reverse edges (UI/HTTP → adapters/providers/SDK/domain; platform testing → adapter internals; adapter → platform-services).

pnpm workspace edges remain: `platform-services` → `integration-github-actions` (public API only); adapter → `integration-sdk` + `testing-contracts`.

## Related

[Boundary Audit](./APZTCMS-020-boundary-audit.md) · [CI/CD Reference Adapter Standard](../architecture/APZHUB-CICD-Reference-Adapter-Standard.md)
