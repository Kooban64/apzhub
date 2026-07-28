# Known Limitations Register — APZQEP-PORTFOLIO-001

Consolidated **by reference** from each capability's own Known Limitations page. No new limitation is introduced or reclassified by this document; where a source disposition exists (blocking / non-blocking, expected / accepted), it is preserved as recorded.

## Requirements

Source: [requirements/baselines/KNOWN-LIMITATIONS.md](../../requirements/baselines/KNOWN-LIMITATIONS.md) and [requirements/capability-certification/](../../requirements/capability-certification/README.md)

- No Traceability coverage or impact-analysis engine; no Verification, Test Specification, Test Case, Execution, or Evidence domains — future modules, out of scope by design
- No relationship graph visualisation or unrestricted graph traversal; no AI-generated relationships; no MCP server; no Certification Engine
- No electronic signatures; no baseline unlock/restore/clone/merge/branching; no ordinary baseline deletion; no cross-project baselines; no bulk relationship mutation UI
- Search indexes are eventually consistent projections, not System of Record
- Playwright E2E for Relationships is route smoke; mutation paths covered primarily by component tests with mocks
- Comparison experiences are bounded (membership / history / CV) — no generic graph-diff engine

## Traceability

Source: [traceability/capability-certification/KNOWN-LIMITATIONS.md](../../traceability/capability-certification/README.md)

- No Coverage Engine, Impact Engine, Verification domain, Evidence domain, Certification Engine, AI, or MCP — Matrix presentation only, not Coverage or Impact analysis
- Graph deferred — no graph visualisation as product System of Record in 1.0.0
- Permissive endpoint resolver for unimplemented peer domains (intentional until peer domains ship)
- Playwright is smoke-level route reservation; mutation paths covered primarily by package and UI component tests
- Search (`trace_link` projection) is eventually consistent, not System of Record
- Traceability does not own Requirements Relationships (that remains ARCH-005 / Requirements 1.0.0)

## Verification

Source: [verification/capability-certification/KNOWN-LIMITATIONS.md](../../verification/capability-certification/README.md)

- No Evidence, Coverage, Impact, or Certification Engine integration; no AI or MCP implementation — expected, future programmes
- List API has no first-class `assignedTo` filter (My Queue uses status filter + presentation filter)
- Default subject resolver permissive for unwired domains (documented, injectable stricter resolvers)
- Playwright suite is smoke / route reservation; authenticated E2E mutations covered by Vitest mocks
- No dedicated 100k-scale load-test campaign under CERT-040D — pagination architecture in place

## Test Specifications

Source: [test-specifications/capability-certification/KNOWN-LIMITATIONS.md](../../test-specifications/capability-certification/README.md)

- No Evidence, Coverage, Impact, or Certification Engine integration; no AI or MCP implementation — expected, future programmes
- **ADR-0074** `returnToDraft` contract delta — expected; requires a separate Domain/Infrastructure then UI programme (see [ADR-0074](../../../../adr/ADR-0074-qep-test-specification-rejected-return-to-draft-available-actions.md))
- Authenticated Playwright uses API route mocks (same pattern as Support/TCMS); Vitest + contracts lock the action matrix
- Module discovery may need `modules/` on discovery roots — deep links remain authoritative
- Preference Service named saved views not implemented — URL + session query persistence satisfies the OES round-trip requirement
- No dedicated large-scale load-test campaign under CERT-050D

## Test Plans

Source: [test-plans/capability-certification/KNOWN-LIMITATIONS.md](../../test-plans/capability-certification/README.md)

Inherited from Infrastructure (CERT-060B):

| ID | Limitation | Disposition |
| -- | ---------- | ------------ |
| L-01 | Version comparison (`CompareVersions` / `GET .../compare`) not implemented | Deferred capability; Workbench presents a governed unavailable slot, no fabricated diff |
| L-02 | Dedicated `GET .../items` not provided; items available on plan GET DTO | Approved variance, not a correctness defect |
| L-03 | Package line coverage below aspirational OES objectives (ECR: 77.07% lines) | Accepted with justification; behavioural coverage is high |

Inherited from Workbench (CERT-070A):

| ID | Item | Disposition |
| -- | ---- | ------------ |
| P-01 | Some lifecycle-chain Playwright journeys not asserted as discrete click-through tests | Does not block — identical `availableActions`-gated mechanism already proven elsewhere |
| P-02 | Not-found (404) governed state not separately Playwright-asserted (only 403 is) | Does not block — same code path as the asserted 403 case |
| P-03 | Some panels not separately axe-scanned | Does not block — reuse already axe-scanned primitives |
| P-04 | Preference Service named saved views not implemented | Approved scope boundary; URL/session round-trip satisfies the accepted OES |

Inherited from Domain (CERT-060A): no AI / MCP implementation; no Evidence / Coverage / Impact / Certification Engine integration — expected, future programmes, outside the Test Plans capability boundary.

## Cross-capability pattern (not a limitation, a deliberate portfolio boundary)

Across all five capabilities: **no Evidence capability, no Coverage capability, no Impact capability, no Certification Engine integration, no AI implementation, no MCP implementation.** These are consistently treated as **future programmes**, not defects in the Foundation. This consistency is itself evidence the Foundation was scoped and delivered coherently, and it defines the shape of the indicative Wave 2 roadmap (see [WAVE-2-ROADMAP.md](./WAVE-2-ROADMAP.md)).

## Freeze implication

None of the limitations above are remediated by this programme. They remain outside each capability's frozen **1.0.0** surface until separately authorised under a new Owner-authorised programme, per the freeze terms recorded in each capability's own freeze pack.

## STOP

This register restates existing, Owner-accepted limitations. It does not evaluate, remediate, or reclassify any of them.
