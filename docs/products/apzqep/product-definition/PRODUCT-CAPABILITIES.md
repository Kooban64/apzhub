# APZ QEP — Product Capability Classification

> **Programme:** APZQEP-DEF-002 (expansion of APZQEP-DEF-001)  
> **Baseline version:** 1.0.0-def (expanded)

## Classification dimensions

| Dimension | Values |
| --------- | ------ |
| Class | Foundation · Core · Enterprise · Premium · AI · Experimental · Marketplace · Future |
| Horizon | MVP · Phase 2 · Phase 3 · Enterprise · AI · Marketplace |

Classification considers customer value, differentiation, enterprise necessity, dependency, risk, operational maturity, engineering complexity, and time to value — not ambition alone.

## Capability map (summary)

| Capability area | Class | Horizon | Notes |
| --------------- | ----- | ------- | ----- |
| Tenant/users/RBAC | Foundation | MVP | Enterprise necessity; multi-tenant isolation |
| Projects quality workspace | Core | MVP | Portfolio and project contexts for QE |
| Requirements approve/baseline | Core | MVP | Quality-relevant requirement governance |
| Manual verification library/design/sessions | Core | MVP | Differentiator vs “AI-only” tools; first-class |
| Evidence capture/packs/lock | Core / Differentiator | MVP | Lock on certification approve |
| Defects lifecycle | Core | MVP | Linked to verification and traceability |
| Traceability matrix/gaps | Core | MVP | Requirement → verification → evidence coverage |
| Release readiness gates | Core / Differentiator | MVP | Aggregated confidence before certification |
| Human certification | Core / Differentiator | MVP | Mandatory accountable human decision |
| Dashboards + export | Core | MVP | Executive, release, compliance views |
| Audit search/export | Foundation | MVP | Immutable quality audit trail |
| Automation ingest (GitHub path) | Foundation | MVP foundation | Depth Phase 2; QEP is not a runner |
| Risk register | Core | MVP foundation / P2 | Risk exposure linked to readiness |
| Integration Centre basics | Foundation | MVP foundation | Platform Services and connector config |
| Quality Intelligence advanced | Premium | Phase 2–3 | Explainable decision support |
| Knowledge base full | Core | Phase 2 | Reuse and continuous improvement |
| AI workspace enabled | AI | AI horizon | Default OFF; drafts under human gates |
| MCP gated write | AI / Premium | AI horizon | Governed IDE/agent channel |
| Continuous verification/cert signals | Future / Enterprise | Phase 3 | L7 maturity; never auto-certify |
| Marketplace packages | Marketplace | Marketplace | P3 extensibility |

## Capability by product module

| Module area | Primary capabilities | MVP |
| ----------- | -------------------- | --- |
| Home / Command Centre | Dashboards, alerts, quick actions | Yes |
| Portfolio / Projects | Quality workspace contexts | Yes |
| Requirements | Approve, baseline, import | Yes |
| Verification Library | Procedure catalogue, reuse | Yes |
| Verification Design | Design, review, approve | Yes |
| Execution and Sessions | Manual sessions, runs, results | Yes |
| Automation Management | Ingest, map, govern (not run) | Foundation |
| Defects | Raise, triage, retest linkage | Yes |
| Evidence | Capture, packs, lock | Yes |
| Traceability | Matrix, gaps, coverage | Yes |
| Risk | Register, exposure, readiness link | Foundation |
| Release Readiness | Gates, waivers, snapshot | Yes |
| Certification | Human decision, outcomes, lock | Yes |
| Quality Intelligence | Trends, explainability | Phase 2 |
| Reporting | Executive, compliance, export | Yes |
| Knowledge | Articles, reuse | Phase 2 |
| AI Quality Workspace | Draft, review (governed) | Default OFF |
| MCP / DX | Governed agent tools | Deferred |
| Integration Centre | Connector config | Foundation |
| Administration | Tenancy, RBAC, config | Yes |
| Audit / Compliance | Search, export, retention | Yes |
| Search / Navigation | Unified discovery | Yes |

## DEF-002 note

Capability classification and horizons are unchanged from DEF-001 decisions. DEF-002 expanded module-to-capability mapping for enterprise clarity.
