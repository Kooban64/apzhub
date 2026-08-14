# SPR-APZPEN-003 — Live runner dispatch

> **Status:** **DELIVERED**  
> **Depends on:** [SPR-APZPEN-002](./SPR-APZPEN-002-provider-ingest.md) · [APZTOOLS-HOST-LAYOUT](../operations/APZTOOLS-HOST-LAYOUT.md)
> **Continue:** [SPR-APZPEN-004](./SPR-APZPEN-004-ce-product-complete.md)

## Goal

Dispatch ZAP / Trivy / Semgrep / Nuclei jobs into `~/apztools/security` Docker runners, then ingest artefacts into the engagement — **scope-gated**, RoE required.

## Delivered

1. Host layout: `security` / `quality` / `workbench` / `shared`
2. `runner-dispatch.ts` — compose exec builders, scope checks, dry-run
3. `POST /api/v1/apzpen/engagements/:id/dispatch`
4. UI dry-run buttons on engagement detail
5. Unit tests for scope + command building

## Safety

- No scan outside engagement scope (web/API tools)
- RoE must be approved
- Dry-run writes job metadata without executing Docker
- Live runs write under `security/out/{tool}/`

## Next

- GitHub App read + PR security position
- Customer portal + PDF packs
- Greenbone task trigger from APZPEN (GMP)
