# SPR-APZPEN-002 — Provider ingest & certification controls

> **Status:** **DELIVERED**  
> **Depends on:** [SPR-APZPEN-001](./SPR-APZPEN-001-security-assurance-foundation.md)  
> **Pillar:** [APZPEN Vision](../strategy/APZPEN-ENTERPRISE-SECURITY-ASSURANCE-PLATFORM.md)
> **Continue:** [SPR-APZPEN-003](./SPR-APZPEN-003-live-runner-dispatch.md) · [SPR-APZPEN-004](./SPR-APZPEN-004-ce-product-complete.md)

---

## Goal

Connect best-of-breed security tool **artefacts** into APZPEN findings without turning the product into a scanner UI.

## Delivered

1. `provider-ingest.ts` — ZAP JSON, SARIF (Trivy/Semgrep), Greenbone simplified, Nuclei JSONL
2. Deduplicating import (`title` + `location` + `providerTool`)
3. `POST /api/v1/apzpen/engagements/:id/ingest`
4. Schedule modes (once / frequent / on-demand) + human **certify** (blocked on open criticals)
5. Engagement UI: paste artefact · schedule · certify · remediate/retest
6. Unit tests for ingest + certify path

## Next (SPR-APZPEN-003+)

- Live runner orchestration (dispatch to ZAP/Trivy/Greenbone clusters)
- GitHub App read + PR security position
- Customer portal
- Formal executive/technical/compliance PDF packs

## Test command

```bash
pnpm exec vitest run apps/web/lib/apzpen
```
