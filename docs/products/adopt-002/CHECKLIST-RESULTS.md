# SPR-ADOPT-002 — Checklist results

Walked against commercial pillar operator guides on 2026-08-15 (BetterAuth only).

## APZPRD — “can our team use Projects?”

| Item                                    | Result                                                                     |
| --------------------------------------- | -------------------------------------------------------------------------- |
| Org entitled to Projects                | Pass (subscription + user grant)                                           |
| Users sign in with BetterAuth only      | Pass                                                                       |
| Readiness shows Authentik used = **no** | Pass (`authentikUsed: false`)                                              |
| Projects appears for entitled roles     | Pass (API access after grant)                                              |
| List/open without Plane login screen    | Pass — list empty until Plane adapter configured; no Plane/Authentik login |
| Authentik not required for journey      | Pass                                                                       |

## APZQEP — release “done” bar (reachability dogfood)

| Item                                 | Result                                                              |
| ------------------------------------ | ------------------------------------------------------------------- |
| Sign-in BetterAuth                   | Pass                                                                |
| Home / readiness / RC path reachable | Pass (security-assurance + MCP + Phase 2 ledgers)                   |
| Security assurance reviewed / honest | Pass — `unavailable` with no engagements linked                     |
| Continuous signals endpoints         | Pass (empty signals)                                                |
| No AI/MCP/scanner auto-approve       | Pass — advisory surfaces only                                       |
| Full GO ceremony on live change      | Deferred — not required for adopt pass; ops can run on real release |

## APZPEN — engagement path

| Item                            | Result                                           |
| ------------------------------- | ------------------------------------------------ |
| Sign-in BetterAuth              | Pass                                             |
| Entitlement                     | Pass after grant                                 |
| Create/open engagement          | Pass — draft engagement created                  |
| Artefact ingest path documented | Pass (operator guide; Faraday honesty in health) |
| Optional GMP/Faraday live       | Not required — skipped                           |

## Verdict

**SPR-ADOPT-002 COMPLETE** — dogfood pass closed; blockers fixed; residual host Plane enablement documented.
