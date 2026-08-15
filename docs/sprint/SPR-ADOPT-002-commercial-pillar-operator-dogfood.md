# SPR-ADOPT-002 — Commercial pillar operator dogfood

> **Status:** **COMPLETE · DELIVERED** — 2026-08-15  
> **Depends on:** [SPR-DOCS-001](./SPR-DOCS-001-commercial-pillar-operator-guides.md) **COMPLETE**; [SPR-APZPRD-003](./SPR-APZPRD-003-projects-workbench-deepen.md) **COMPLETE**  
> **AuthN:** **BetterAuth only** — [OWNER-BETTERAUTH-SOLE-AUTHN](../decisions/OWNER-BETTERAUTH-SOLE-AUTHN.md)  
> **Does not:** Authentik config · stop Authentik containers · Cap reopen · new commercial features · APZPEN enterprise unpark

## Outcome

Walk the three commercial pillar **operator user guides** on this host, record friction, and fix clear product defects that block day-one adoption. Evidence lives under `docs/products/adopt-002/`.

## Scope

| Pillar     | Guide checklist source                                                      | Dogfood bar                                                                                     |
| ---------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **APZPRD** | [OPERATOR-USER-GUIDE §6](../products/apzprd/guides/OPERATOR-USER-GUIDE.md)  | BetterAuth sign-in · Readiness posture · Projects list without Plane login                      |
| **APZQEP** | [OPERATOR-USER-GUIDE §10](../products/apzqep/guides/OPERATOR-USER-GUIDE.md) | Home / readiness / RC path reachable · bridge panel honest · no auto-certify                    |
| **APZPEN** | [OPERATOR-USER-GUIDE](../products/apzpen/guides/OPERATOR-USER-GUIDE.md)     | Engagement path reachable · artefact ingest path documented · optional GMP/Faraday not required |

## Acceptance

1. Host web is reachable for dogfood (`/api/health` via :3300 or Caddy).
2. Friction log captures every blocker/high item found during the pass.
3. Clear product bugs that block checklist items are fixed in-repo (or explicitly deferred with Owner note).
4. Evidence pack records BetterAuth-only posture (no Authentik used for APZHUB journeys).
5. Authentik containers remain untouched.
6. Sprint closed with COMPLETE when checklists are walked and evidence filed.

## Non-goals

- Full E2E release certification ceremony on production data
- Enabling live GMP / Faraday / MCP stdio (ops appendix only)
- Stopping or reconfiguring Authentik
- Platform polish sprint (follows after thin APZPEN parked note)

## Delivery artefacts

| Artefact          | Path                                                               |
| ----------------- | ------------------------------------------------------------------ |
| Friction log      | [FRICTION-LOG.md](../products/adopt-002/FRICTION-LOG.md)           |
| Evidence          | [EVIDENCE.md](../products/adopt-002/EVIDENCE.md)                   |
| Checklist results | [CHECKLIST-RESULTS.md](../products/adopt-002/CHECKLIST-RESULTS.md) |

## Delivery record

| ID                | Landed                                                        |
| ----------------- | ------------------------------------------------------------- |
| Host bring-up     | Next.dev on :3300; Caddy health recovered                     |
| Module resolution | Faraday/Greenbone + config governance + drizzle-orm           |
| Grants            | Classic dogfood user entitled; demo seed fixed                |
| Projects list     | Soft-empty when Plane adapter disabled                        |
| Dogfood           | QEP/APZPEN/APZPRD operator checklist walked (BetterAuth only) |
