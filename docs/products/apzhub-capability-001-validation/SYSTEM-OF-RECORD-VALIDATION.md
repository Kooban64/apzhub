# System of Record Validation

| Field     | Value                            |
| --------- | -------------------------------- |
| Programme | APZHUB-CAPABILITY-001-VALIDATION |
| Status    | **COMPLETE**                     |
| Timestamp | 20260805T101500Z                 |

## Rule

> No capability may become a second System of Record.

Unified Work Experience may hold **derived presentation / queue projection** only — never authoritative business state for product entities.

## Entity → SoR

| Entity / concern                           | Authoritative owner                       | Consumers                                    | Allowed in My Work                         |
| ------------------------------------------ | ----------------------------------------- | -------------------------------------------- | ------------------------------------------ |
| Project / Task / Sprint                    | **APZ Projects**                          | Time, Support, Search, shell                 | Reference + status projection              |
| Support request / conversation             | **APZ Support**                           | Projects (context), Search, shell            | Reference + status projection              |
| Time entry / timesheet                     | **APZ Time**                              | Projects (context), Search                   | Reference + status projection              |
| Quality Flow / Decision Package / Evidence | **APZQEP**                                | All product change programmes                | Reference + status projection              |
| Document                                   | **APZ Documents** (when adopted)          | Projects, Support                            | Reference (future)                         |
| Identity / session / roles                 | **APZHUB** (platform)                     | All products                                 | Actor resolution only                      |
| Permissions                                | **APZHUB** (platform)                     | All products                                 | Filter My Work                             |
| Notifications / attention                  | **APZHUB** Attention (platform framework) | Products publish events; do not own delivery | May feed queues; not SoR for work entities |
| Search index                               | **APZHUB** Search (derived)               | Products register providers                  | Discovery only — not SoR                   |
| My Work queue entries                      | **Derived** from product SoRs             | Shell / Unified Work Experience              | Projection only                            |
| Engine entities (Plane/Zammad/Kimai/…)     | Connector-internal only                   | Never user-facing SoR                        | **Forbidden**                              |

## Validation outcomes

| Criterion                                            | Result                                         |
| ---------------------------------------------------- | ---------------------------------------------- |
| Unified Work Experience as SoR for tasks             | **FAIL if attempted** — must remain projection |
| Unified Work Experience as SoR for tickets           | **FAIL if attempted** — must remain projection |
| Unified Work Experience as SoR for time              | **FAIL if attempted** — must remain projection |
| Unified Work Experience as SoR for quality           | **FAIL if attempted** — must remain projection |
| Platform identity / permissions as cross-cutting SoR | **PASS** (already platform-owned)              |
| Derived search / queue indexes                       | **PASS** if non-authoritative (foundation 011) |

## Conclusion

**VALIDATED** — provided future engineering stores only derived queue/presentation state and mutates business entities only through owning products / APZQEP.
