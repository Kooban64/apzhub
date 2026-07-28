# Requirements Known Limitations

Authorised scope decisions and operational constraints for baseline **1.0.0**. These are not open defects unless marked otherwise.

## Domain / product scope (intentional)

- No Traceability coverage or impact-analysis engine
- No Verification, Test Specification, Test Case, Execution, or Evidence domains
- No relationship graph visualisation or unrestricted graph traversal
- No AI-generated relationships, recommendations, or decisioning
- No MCP server / tools for Requirements
- No Certification Engine
- No electronic signatures / legal signing on baselines
- No baseline unlock, restore, clone, merge, or branching
- No ordinary baseline deletion
- No cross-project / mixed-domain baselines
- No bulk relationship mutation UI (no safe bulk mutation API)
- No unrestricted endpoint or type rewrite after create (domain rules)

## Technical / operational

- Search indexes are eventually consistent projections — not System of Record
- Project/release scope references for relationships remain reference-shape validated
- Playwright E2E for Relationships is route smoke; mutation paths covered primarily by component tests with mocks
- Fingerprint / UI scale with large baseline memberships
- Comparison experiences are bounded (membership / history / CV) — no generic graph-diff engine

## Not limitations of this baseline

Future modules (Traceability, Verification, etc.) require separate Owner Architecture and Engineering programmes — they are out of scope, not incomplete Requirements work.
