# Installation Review — APZQEP-161R

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-161R      |
| Verdict   | **PASS**         |
| Timestamp | 20260803T152830Z |

## Install path (fresh team → first execution)

Aligned to [QUICK-START-GUIDE.md](./QUICK-START-GUIDE.md) (~10–15 minutes for operators familiar with the monorepo).

| Step | Action                                               | Required for dry-run |
| ---- | ---------------------------------------------------- | -------------------- |
| 1    | Clone APZHUB monorepo; `pnpm install`                | Yes                  |
| 2    | Configure platform env (auth/DB per existing GA ops) | Yes                  |
| 3    | Start `apps/web` (or compose stack per ENVIRONMENT)  | Yes                  |
| 4    | Open `/workspace/qep/automation`                     | Yes                  |
| 5    | Click **Run Playwright dry-run**                     | Yes                  |
| 6    | Optional: install `playwright` + set live flag       | No                   |

## Findings

| Topic                | Finding                                                              | Result |
| -------------------- | -------------------------------------------------------------------- | ------ |
| Package presence     | `@apzhub/platform-automation`, `@apzhub/qep-automation` in workspace | PASS   |
| Hard dependency risk | Playwright is **optional** peer — install not blocked                | PASS   |
| Config surface       | Small (`APZHUB_AUTOMATION_LIVE`)                                     | PASS   |
| Host coexistence     | Follows ENVIRONMENT.md; no Wave 1 port conflict introduced           | PASS   |
| Dedicated installer  | No standalone product installer — monorepo/GA path                   | PASS\* |

\* Acceptable for current self-hosted enterprise posture; SaaS installer out of scope.

## Gaps

- No single-page “Automation Installation Guide” existed before 161R — **Quick Start** closes the gap for teams.
- Live browser install steps are secondary and optional.
