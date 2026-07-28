# APZHUB Deployment Strategy

> **Programme:** APZHUB-OPERATIONS-001  
> **Date:** 2026-07-20

---

## Principles

| Principle           | Rule                                                                   |
| ------------------- | ---------------------------------------------------------------------- |
| Promote forward     | Dev → Test → Staging → Production                                      |
| Immutable artefacts | Build once; promote same artefact where practical                      |
| Rollback first      | Prefer rollback over forward-fix under P1                              |
| Coexistence         | Do not break legacy `apz-stack` ports/hostnames without Owner Approval |
| Edge TLS            | Caddy/Nginx for TLS; gateway for app traffic                           |

## Environment strategy

| Env         | Deploy trigger                       | Data                                    |
| ----------- | ------------------------------------ | --------------------------------------- |
| Development | PR / local                           | Synthetic                               |
| Testing     | CI pipeline                          | Synthetic / fixtures                    |
| Staging     | Release candidate                    | Anonymised or synthetic Production-like |
| Production  | Approved Change after Staging verify | Production                              |

## Production deployment checklist

1. Change approved · maintenance communicated
2. Backup / snapshot verified recent
3. Deploy artefact
4. Health hierarchy green (platform → service → connector → engine)
5. Smoke: auth, gateway health, critical product path
6. Monitor alerts 30–60 minutes
7. Close Change or rollback

## Explicit non-goals (this doc)

Does not implement CD pipelines or monitoring — governance only.
