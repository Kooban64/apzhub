# Evidence Management — testing scaffold (APZQEP-ENG-110A)

Structural folders only. Behavioural tests are authorised in later waves.

| Folder         | Future wave focus                           |
| -------------- | ------------------------------------------- |
| `unit/`        | Pure helpers                                |
| `domain/`      | Lifecycle / invariants (ENG-110B)           |
| `application/` | availableActions / ACL (ENG-110C)           |
| `integration/` | Repositories + StoragePort fakes (ENG-110D) |
| `api/`         | Contract tests (ENG-110D)                   |
| `security/`    | Fail-closed / default-deny (mandatory)      |
| `lifecycle/`   | Full Capture→Dispose paths                  |
| `integrity/`   | Hash / seal / verify                        |
| `performance/` | Targets from OES-ENG-091A PART-05           |
| `playwright/`  | Workbench journeys (ENG-110E)               |

Wave 1 boundary tests live in `src/architecture-boundaries.test.ts`.
