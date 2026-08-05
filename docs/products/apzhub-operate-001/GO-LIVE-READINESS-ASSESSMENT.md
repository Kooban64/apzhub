# Go-Live Readiness Assessment

| Field        | Value                                                                                 |
| ------------ | ------------------------------------------------------------------------------------- |
| Programme    | APZHUB-OPERATE-001                                                                    |
| Kind         | Operational validation — **no engineering**                                           |
| Timestamp    | 20260805T121500Z                                                                      |
| Method       | Execute approved [GO-LIVE-CHECKLIST.md](./GO-LIVE-CHECKLIST.md); report blockers only |
| Code changes | **NONE**                                                                              |

## Verdict

| Class                                                           | Result                                                        |
| --------------------------------------------------------------- | ------------------------------------------------------------- |
| Engineering blockers (must fix in code before internal rollout) | **NONE**                                                      |
| Platform / product artefacts for controlled internal use        | **READY**                                                     |
| People / Owner operational sign-off                             | **PENDING** (blocks go-live authorisation, not engineering)   |
| Overall                                                         | **READY FOR OWNER GO-LIVE DECISION** after people items close |

No new code is required for controlled internal rollout. Remaining items are organisational.

---

## Checklist validation

### Platform

| Item                                            | Result              | Evidence                                                                                                                                                                                                                                    |
| ----------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| APZHUB reachable (URL, TLS, DNS)                | **PASS**            | `https://apzhub.apzportal.apzor.com/api/health` → HTTP 200; nginx `05-apzhub-platform.conf` present; `ENVIRONMENT.md` hostname record                                                                                                       |
| Authentication (single sign-in)                 | **PASS (artefact)** | Better Auth path in platform; no engine login screens in RI native products. Live cohort dry-run still required under People                                                                                                                |
| My Work at `/workspace/home`                    | **PASS**            | `platform-home` manifest title **My Work**; `MyWorkView` wired; `GET /api/v1/my-work` present                                                                                                                                               |
| Activity Bar permission-driven                  | **PASS (artefact)** | Workbench permission model; enablement via [ROLE-ENABLEMENT.md](./ROLE-ENABLEMENT.md)                                                                                                                                                       |
| Health / monitoring acceptable for internal use | **PASS with note**  | `/api/health` healthy (DB + Redis). Platform ops monitoring standards exist under `docs/operations/`. Live APZHUB-specific Grafana productisation remains limited (accepted for internal pilot; not an engineering blocker for OPERATE-001) |

**Conditional finding (Owner accept or ops config):** runtime health reports `environment: "development"`, `coreQePersistence.productionLike: false`. Acceptable for controlled internal pilot if Owner accepts; production-like config is an **ops configuration** action, not a new programme.

### Products (RI set)

| Item                        | Result              | Evidence                                                        |
| --------------------------- | ------------------- | --------------------------------------------------------------- |
| APZ Projects usable         | **PASS (artefact)** | RI #003; ops pack under `docs/products/apzprojects/`            |
| APZ Support usable          | **PASS (artefact)** | RI #002; ops pack under `docs/products/apzsupport/`             |
| APZ Time usable             | **PASS (artefact)** | RI #001; ops pack under `docs/products/apztime/`                |
| APZQEP known to engineering | **PASS (artefact)** | APZQEP V1.1 frozen; product checklists / Quality Flows in force |

### People

| Item                               | Result      | Notes                                                                                        |
| ---------------------------------- | ----------- | -------------------------------------------------------------------------------------------- |
| Pilot cohort identified            | **PENDING** | Owner / managers — not repository-closeable                                                  |
| Accounts provisioned               | **PENDING** | Administrator action                                                                         |
| Onboarding dry-run user            | **PENDING** | One successful Day-0 walkthrough required                                                    |
| Internal support contact published | **PARTIAL** | [SUPPORT-MODEL.md](./SUPPORT-MODEL.md) defines channels; **named** human contacts not filled |

### Operations

| Item                          | Result      | Notes                                                                                       |
| ----------------------------- | ----------- | ------------------------------------------------------------------------------------------- |
| Support model accepted        | **PENDING** | Ops / Admin acceptance signature                                                            |
| Metrics owners named          | **PARTIAL** | Roles named in [OPERATIONAL-METRICS.md](./OPERATIONAL-METRICS.md); individuals not assigned |
| 30-day plan scheduled         | **PENDING** | Plan exists; calendar dates not set                                                         |
| 90-day learning scheduled     | **PENDING** | Plan exists; cadence owner not named                                                        |
| My Work Review cadence agreed | **PENDING** | Review defined; first date not set                                                          |

### Explicit freeze at go-live

| Item                                         | Result                        |
| -------------------------------------------- | ----------------------------- |
| No new product programmes as part of go-live | **PASS** (policy)             |
| No speculative capabilities in go-live scope | **PASS** (policy)             |
| Comms: Observe → Learn → Review → Invest     | **PENDING** (Owner messaging) |

### Sign-off

| Role                   | Status       |
| ---------------------- | ------------ |
| Platform Administrator | **UNSIGNED** |
| Product Board / Owner  | **UNSIGNED** |

---

## Rollback arrangements

| Concern                              | Status         | Reference                                                                                                                   |
| ------------------------------------ | -------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Platform change rollback discipline  | **DOCUMENTED** | `docs/operations/DEPLOYMENT-STRATEGY.md`, `RELEASE-MANAGEMENT.md`, `HOTFIX-POLICY.md`                                       |
| Prefer rollback under P1             | **DOCUMENTED** | Deployment strategy                                                                                                         |
| Internal rollout “rollback” (people) | **DEFINED**    | Pause expansion; revert cohort enablement; keep RI products frozen — no data migration required for enablement-only rollout |

No engineering gap found for rollback documentation.

---

## Support ownership

| Layer                       | Status                                                     |
| --------------------------- | ---------------------------------------------------------- |
| Channel model               | **COMPLETE** — APZ Support → Administrator → Product Owner |
| Named on-call / named admin | **PENDING** — Owner / Ops assignment                       |

---

## Monitoring

| Signal                                | Status                                     |
| ------------------------------------- | ------------------------------------------ |
| `GET /api/health`                     | **ACTIVE** (HTTP 200; DB/Redis healthy)    |
| APZHUB Postgres / Redis containers    | **UP** (`apzhub-postgres`, `apzhub-redis`) |
| Web on :3300                          | **LISTENING**                              |
| Deep product observability dashboards | **LIMITED** — accepted for internal pilot  |

---

## User provisioning readiness

| Artefact              | Status                                                                      |
| --------------------- | --------------------------------------------------------------------------- |
| Onboarding process    | **COMPLETE** — [INTERNAL-USER-ONBOARDING.md](./INTERNAL-USER-ONBOARDING.md) |
| Role map              | **COMPLETE** — [ROLE-ENABLEMENT.md](./ROLE-ENABLEMENT.md)                   |
| Actual pilot accounts | **PENDING**                                                                 |

---

## Documentation completeness

| Pack                                            | Status       |
| ----------------------------------------------- | ------------ |
| OPERATE-001 deliverables (handbook → readiness) | **COMPLETE** |
| Product RI + ops packs (#001–#003)              | **COMPLETE** |
| Current operating state / My Work Review        | **COMPLETE** |

---

## Blockers that prevent internal rollout

### Engineering blockers

**None.**

### Operational blockers (must clear before Owner authorises go-live)

1. Pilot cohort identified and accounts provisioned
2. At least one dry-run user completes Day-0 onboarding
3. Named internal support / admin contacts published
4. Owner + Platform Administrator sign [GO-LIVE-CHECKLIST.md](./GO-LIVE-CHECKLIST.md)
5. Owner accepts `development` / non-production-like runtime **or** ops switches production-like config

Items 1–5 require people and configuration—not a new engineering programme.

---

## Recommendation

**Do not authorise further engineering programmes for go-live.**

Clear the five operational blockers, then Owner authorises controlled internal rollout.

After go-live, conversations return to Product Board form: **What did we learn?**
