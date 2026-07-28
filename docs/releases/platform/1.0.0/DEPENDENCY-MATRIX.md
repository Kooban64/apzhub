# APZHUB Platform 1.0.0 — Dependency Matrix

| Consumer                 | Depends on                                             | Notes                                 |
| ------------------------ | ------------------------------------------------------ | ------------------------------------- |
| All commercial products  | Identity · AuthZ · Gateway · Workbench patterns        | Mandatory                             |
| All OSS-backed products  | Integration SDK **1.0.0** · product adapter            | Plane/Kimai/Zammad/Metabase/n8n       |
| Projects                 | Plane adapter · Search publication                     | Production **1.1.0**                  |
| Time                     | Kimai adapter · Time HTTP/services                     | Phase 1                               |
| Support                  | Zammad adapter · Search publication                    | PRWL                                  |
| Documents                | Native document platform                               | PRWL                                  |
| TCMS                     | testing-* · GHA adapter · Search testing               | PRWL · no Kiwi                        |
| Analytics                | Metabase adapter · analytics platform                  | PRWL                                  |
| Workflow                 | n8n adapter · workflow platform                        | PRWL · execute limits per product KL  |
| Law                      | Native SoR · legal-business-core · platform frameworks | PRWL · FIN-001 deferred               |
| Cross-product automation | Event Bus / Workflow / Notifications                   | Depth varies — see Integration Matrix |
| Portfolio certification  | Product SemVer packs + KF + PDS                        | This programme                        |
