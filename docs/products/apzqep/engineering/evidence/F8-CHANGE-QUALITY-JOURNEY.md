# F8 — Change Quality Journey

| Field       | Value                                                             |
| ----------- | ----------------------------------------------------------------- |
| Status      | **LOCAL PROOF** 2026-08-09                                        |
| Bar         | One guided path for a change; deep-links only; never auto-certify |
| Not claimed | New SoR; auto-evaluate; replacing RC/design accept UIs            |

## Done when

- `composeChangeQualityJourney` returns 5 steps with hrefs
- `GET …/quality-journey/by-change/{id}` returns advisory journey
- UI at `/workspace/qep/quality-journey` usable without CLI
- Source policy: no cert decision / design accept / regression accept calls

## Local proof (2026-08-09)

- Unit: `apps/web/lib/qep/change-quality-journey.test.ts` (3 pass)
- API: `GET …/quality-journey/by-change/…f2b1786…` → 200
  - 5 steps; evidence domains 6; cert READY 100% + human GO
  - deepLinks: journey, scm, designAssist, automation, qi, rc, rcEvaluation
- Entry points: SCM “Open journey”, QI / RC deep-links, sidebar Quality Journey
