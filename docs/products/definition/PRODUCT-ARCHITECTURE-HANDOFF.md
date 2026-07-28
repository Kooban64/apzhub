# Product Architecture Handoff

> **Programme:** APZHUB-PRODUCTS-003

## Purpose

Define the minimum content Architecture programmes may rely on when a Definition is approved. This is a **handoff contract**, not an Architecture document.

## Handoff inputs (from Definition)

Architecture SHALL receive:

1. Executive Summary and success criteria
2. Native vs Platform-backed classification and candidate engine (if any)
3. Functional specification (modules, capabilities, non-goals)
4. Information architecture / entity sketch (logical — not physical schema design)
5. Platform Integration table (services consumed)
6. External Integrations inventory (candidates only)
7. Security and compliance expectations
8. AI scope (or explicit exclusion)
9. Data ownership intent (platform metadata vs engine SoR)
10. API / events intent (internal vs external)
11. Risks and open questions
12. Business Approval record

## What Architecture produces next (out of Definition scope)

- `ARCHITECTURE.md` (physical design on Platform 1.4)
- Product / Platform ADRs
- Connector strategy and capability maps
- Schema / migration design
- Detailed permission catalogues

## Handoff checklist

- [ ] Definition sections 1–20 complete or N/A-rationalised
- [ ] Definition checklist complete
- [ ] Business Approval APPROVED
- [ ] Open questions listed (none silent)
- [ ] Platform freezes acknowledged
- [ ] No implementation code proposed as “already started”
- [ ] Product Manager ready-for-Architecture sign-off present

## Forbidden at handoff

- Module → Connector / Engine designs that skip Platform Services
- Engine brand as product identity
- Platform redesign proposals disguised as product needs (escalate to Platform ADR + Owner)
