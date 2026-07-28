# APZHUB Platform 1.1.0 — Dependency Matrix

> Updated from [Platform 1.0.0 DEPENDENCY-MATRIX](../1.0.0/DEPENDENCY-MATRIX.md)

| Consumer                 | Depends on                                                            | 1.1.0 notes                                             |
| ------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------- |
| All commercial products  | Identity · AuthZ · Gateway · Workbench patterns                       | Mandatory                                               |
| All OSS-backed products  | Integration SDK **1.0.0** · product adapter                           | Plane/Kimai/Zammad/Metabase/n8n                         |
| Projects                 | Plane adapter · Search publication                                    | Production **1.1.0**                                    |
| Time                     | Kimai adapter · Time HTTP/services                                    | Phase 1                                                 |
| Support                  | Zammad adapter · Search · **DomainEventPublisher** · ENF Attention    | Event publish + Attention wired                         |
| Documents                | Native document platform                                              | PRWL                                                    |
| TCMS                     | testing-* · GHA adapter · Search testing                              | PRWL · no Kiwi                                          |
| Analytics                | Metabase adapter · analytics platform                                 | PRWL                                                    |
| Workflow                 | n8n adapter · workflow platform · optional Automation Foundation      | Execute gated; trigger intents deferred                 |
| Law                      | Native SoR · legal-business-core · ENF/ATF persisted stores · AuthZ   | OBS-LAW-01/02 closed                                    |
| Cross-product automation | Event Bus · AutomationFoundation · (future) product Platform Services | Foundation packaged; AU-* product effects not delivered |
| Portfolio certification  | Product SemVer packs + KF + PDS + 1.1 evidence                        | This programme                                          |
