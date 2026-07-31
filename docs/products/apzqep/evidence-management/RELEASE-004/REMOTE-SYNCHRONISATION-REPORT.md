# Remote Synchronisation Report — APZQEP-RELEASE-004

| Field            | Value                                                    |
| ---------------- | -------------------------------------------------------- |
| Original remote  | `git@github.com:kooban-apzor/apz-portal.git`             |
| Temporary remote | `https://github.com/kooban-apzor/apz-portal.git`         |
| Release identity | **kooban-apzor** (HTTPS credentials from `.secrets/git`) |
| SSH for release  | **NOT AUTHORISED**                                       |
| Go/No-Go         | **GO** @ `20260731T192454Z`                              |

## Execution (2026-07-31 UTC)

| Step | Action                                                   | Result                      |
| ---- | -------------------------------------------------------- | --------------------------- |
| 1    | Push governance tree `HEAD` → `main` (`d3d26349`)        | **PASS**                    |
| 2    | Verify `origin/main` + ancestor `4e1b6f01`               | **PASS**                    |
| 3    | Push promotion `79d9851f` + tag `apzqep-evidence-v1.0.0` | **PASS**                    |
| 4    | Restore `origin` to original SSH URL                     | **PASS** (post docs commit) |

Credentials were supplied via `GIT_ASKPASS` (`/tmp/apzqep-release-askpass.sh`); token values were not logged.

## Classification

Prior **B-01** (SSH push failure) cleared for this execution using Owner-authorised HTTPS push. Operational — not a product defect.
