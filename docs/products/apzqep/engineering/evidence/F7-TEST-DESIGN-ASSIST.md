# F7 — Test Design Assist

| Field       | Value                                                                            |
| ----------- | -------------------------------------------------------------------------------- |
| Status      | **LOCAL PROOF** 2026-08-09                                                       |
| Bar         | Change → advisory draft specs → human accept → Spec SoR; tools still prove READY |
| Not claimed | LLM case generation; auto-execute; auto GO/NO-GO; Tuskr/Kiwi SoR                 |

## Done when

- `composeTestDesignPack` produces REQ + domain-gap drafts from impact + evidence domains
- `GET|POST …/design-proposal` returns advisory pack
- `POST …/design-proposal/accept` creates draft specifications with `metadata.sourceChangeEventId`
- SCM UI: Propose design → review → Accept; QI deep-links to design assist
- Source policy: no certification mutation APIs

## Proof checklist

1. Unit: `apps/web/lib/qep/test-design-assist.test.ts`
2. API: propose on a durable change → ≥1 draft → accept → list specs shows drafts tagged `f7-design-assist`
3. Cert: READY still requires domain evidence from tools (F3/F4) — accept alone does not certify

## Local proof (2026-08-09)

- Change: `chg-github-4c24f53d-ca0b-43fe-a9ea-e72950a9bc68-commit-f2b1786267122abcdef01`
- Propose → 1 draft (`requirement_smoke` for inferred `req-f2-graph`; domain gaps empty because F3 deepen already attached multi-domain evidence)
- Accept → `tsp_341029c6aae543d1` / `F7-3CAB4721-01` status **draft**
- Metadata: `sourceChangeEventId` + `assistOrigin=f7_test_design`; tags include `f7-design-assist`
- Trace link best-effort (may skip when requirement artefact is not registered); Spec SoR write is authoritative
- Operator role granted `qep.specification.create` (+ read/update/search, trace create) for accept path

## Tooling stance

Best-of-breed quality tools (Playwright, Vitest, SARIF security, k6, axe, …) remain verification engines via report ingest / live runner. APZQEP owns design governance, evidence, and human GO/NO-GO.
