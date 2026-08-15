# SPR-ADOPT-004 — LTS-backed commercial dogfood

| Field     | Value                                                                             |
| --------- | --------------------------------------------------------------------------------- |
| Programme | Confirm APZHUB works on owned LTS engines before touching legacy                  |
| Status    | **COMPLETE**                                                                      |
| AuthN     | BetterAuth only                                                                   |
| Host rule | **Do not touch** legacy `apz-*` / Authentik until Owner accepts product-solid bar |

## Checklist results

| Check                                        | Result |
| -------------------------------------------- | ------ |
| Projects health (`liveListOk`, no Authentik) | PASS   |
| Projects list                                | PASS   |
| Support requests list                        | PASS   |
| Time health (Kimai API)                      | PASS   |
| Time timesheets (LTS demo)                   | PASS   |
| Analytics health (Metabase)                  | PASS   |
| Analytics dashboards                         | PASS   |
| Workflow health (n8n)                        | PASS   |
| Workflow engine health                       | PASS   |
| Workflow engine workflows                    | PASS   |

**Score:** 10/10

## Targets (APZHUB-owned only)

| Product   | LTS URL                  |
| --------- | ------------------------ |
| Projects  | `http://127.0.0.1:19085` |
| Support   | `http://127.0.0.1:19081` |
| Time      | `http://127.0.0.1:19083` |
| Analytics | `http://127.0.0.1:19084` |
| Workflow  | `http://127.0.0.1:19678` |

## Legacy left alone (read-only confirmation)

`18081` · `18082` · `18083` · `18084` · `18085` · `15678` · Authentik containers — probed only; not restarted or reconfigured.

Machine-readable run: [EVIDENCE.json](./EVIDENCE.json).
