# F11 — Security / pen-test dispatch

| Field       | Value                                                                      |
| ----------- | -------------------------------------------------------------------------- |
| Status      | **LOCAL PROOF** 2026-08-09                                                 |
| Bar         | Security pack dispatch (Trivy/Semgrep/Nuclei/ZAP) + dual cluster inventory |
| Not claimed | Faraday live; Greenbone production stack; Kali as QEP module; auto GO      |

## Pattern

Same as F10: **dispatch → runner/scanner → report ingest → certify**.

## Default domains

`trivy`, `semgrep`, `nuclei`, `zap`  
Optional: add `greenbone` via `APZHUB_SECURITY_DISPATCH_DOMAINS`.

## Docker clusters

| Cluster             | Doc                                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Testing tools       | [infrastructure/docker/clusters/TESTING-CLUSTER.md](../../../../../infrastructure/docker/clusters/TESTING-CLUSTER.md) |
| Pen-test / security | [infrastructure/docker/clusters/PENTEST-CLUSTER.md](../../../../../infrastructure/docker/clusters/PENTEST-CLUSTER.md) |

## Env

| Flag                                        | Meaning                                                     |
| ------------------------------------------- | ----------------------------------------------------------- |
| `APZHUB_SECURITY_DISPATCH=true`             | Enable F11                                                  |
| `APZHUB_SECURITY_DISPATCH_MODE=record_only` | Ledger without calling GitHub (local)                       |
| `…_OWNER` / `…_REPO` / `…_WORKFLOW`         | e.g. `security.yml`                                         |
| `…_DOMAINS`                                 | default `trivy,semgrep,nuclei,zap` (+ optional `greenbone`) |
| `…_WEBHOOK_URL`                             | Alternate runner webhook                                    |

## Proof checklist

1. Unit: `security-dispatch-on-change.test.ts` (co-exists with F10)
2. Flag on + webhook → security ledger row (`assistOrigin=f11_security_dispatch`)
3. Same change also has F10 quality pack row
4. Journey UI: External verification dispatches (F10 quality · F11 security)
5. No cert mutation from dispatch source

## Local proof (2026-08-09)

- Units: 7 pass (F10 4 + F11 3)
- Webhook → ingress 202 → F10 quality + F11 security ledger rows (`record_only`)
  - security domains: `trivy,semgrep,nuclei,zap`
  - change: `chg-github-4c24f53d-…-commit-f111786287311abcdef01`
- Cluster inventory + compose stubs under `infrastructure/docker/clusters/`
- **Live GHA:** `.github/workflows/security.yml` stub — unset `APZHUB_SECURITY_DISPATCH_MODE=record_only` (see `F12-PUBLISH-AND-RUN-PACKS.md`)

## Greenbone follow-on (same host)

- Official CE compose: `infrastructure/docker/clusters/greenbone/` · project `apzqep-greenbone`
- UI: `http://127.0.0.1:9392` only (host `:443` left for nginx)
- Admin password: `.secrets/greenbone-admin`
- Scan helper: `greenbone/scan-lovebloom.sh` (waits for feed configs; target `lovebloom.apztdg.com` / `196.216.100.6`)
- First boot: SCAP/GVMD_DATA import can take a long time before `Full and fast` appears

## Explicit non-goals (F11 core slice)

- Faraday product integration
- Kali as a QEP module / UI
- Scanners inside the Next.js process
- Auto GO/NO-GO from severity
