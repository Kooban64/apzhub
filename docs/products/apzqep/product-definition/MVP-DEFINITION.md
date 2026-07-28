# APZ QEP — MVP Definition

> **Programme:** APZQEP-DEF-002 (expansion of APZQEP-DEF-001)  
> **Baseline version:** 1.0.0-def (expanded)  
> **Rule:** Commercially and operationally useful complete quality lifecycle — not disconnected screens  
> **AI:** Not required for MVP value · default OFF

## MVP outcome

An organisation can: create a project quality workspace → approve requirements → design and approve **manual** verifications → execute sessions with evidence → raise and retest defects → see traceability and coverage gaps → assess release readiness → **human-certify** with locked evidence pack → audit the decision — without enabling AI or advanced MCP.

MVP delivers a **thin slice through the full lifecycle**, not a partial module dump. Every MVP module participates in the end-to-end path from requirement to certification.

## MVP must support

| Area | MVP inclusion | Enterprise expectation |
| ---- | ------------- | ---------------------- |
| Tenant and user management | Yes | Multi-tenant RBAC; role-based workspace access |
| Project quality workspace | Yes | Portfolio and project contexts for QE scope |
| Requirements | Yes | Approve, baseline, import; quality-relevant only |
| Manual verification | Yes — first-class | Structured and exploratory sessions |
| Verification library | Yes | Reusable procedures; version awareness |
| Verification runs/sessions | Yes | Human-centred execution with result capture |
| Evidence | Yes | Capture, pack assembly, pre-cert review |
| Defects | Yes | Raise, link to verification, retest cycle |
| Traceability | Yes | Matrix, coverage gaps, requirement linkage |
| Release readiness | Yes | Gates, waivers, aggregated snapshot |
| Human certification | Yes | Named accountable actor; locked evidence |
| Dashboards | Yes | Home, project, release views |
| Audit | Yes | Search, export, immutable trail |
| Basic integrations | Yes | Platform + GitHub ingest foundation |
| Import and export | Yes | Requirements import; report/cert export |

## Explicitly not required ON for MVP

| Area | Posture |
| ---- | ------- |
| AI Quality Workspace runtime | OFF — not required for MVP certification path |
| Advanced MCP write tools | Deferred — catalogue documented; runtime later |
| Continuous verification/cert modes | Deferred — Phase 3 / L7 maturity |
| Full ALM sync | Optional/later — link foundation only |
| Marketplace | Out — not MVP scope |
| Quality Intelligence advanced | Phase 2 — basic reporting in MVP |
| Knowledge base full | Phase 2 — minimal optional in MVP |

## MVP persona coverage

MVP must support the primary certification path for: Release Manager (primary certifier), QA Engineer (manual execution), Business Analyst / Product Owner (requirements), Developer (defect/retest), and Administrator (tenancy/RBAC). Other personas have documented workspaces; full depth for all 21 personas is a product definition obligation, not all MVP runtime scope.

## MVP success measures

- Manual verification session completable end-to-end with evidence capture  
- Certification decision recorded with named human actor and locked evidence pack  
- Zero dependency on AI for MVP certification path  
- Traceability shows coverage gaps before certification  
- Audit trail searchable for certification decision and evidence lock  
- Release readiness snapshot reflects defects, risk, and gate status  

## Completeness statement

MVP is a **commercially credible complete quality lifecycle** — sufficient for an enterprise to govern a release decision with confidence. It is intentionally not the full Phase 2–3 roadmap. DEF-002 expanded MVP clarity without changing MVP scope decisions from DEF-001.

## DEF-002 note

MVP boundaries and AI default OFF posture are unchanged (DEF-D-002, DEF-D-005). See [PRODUCT-CAPABILITIES.md](./PRODUCT-CAPABILITIES.md) for full capability horizon mapping.
