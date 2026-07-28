# Application Services

Factory: `createVerificationApplicationService`

Platform wiring: `createQepVerificationPlatformServices` / `ForProduction` / `ForTest` in `@apzhub/platform-services`.

DTO adapter: `toVerificationDto` (includes server-authoritative `availableActions`).

## Pipeline

tenant/actor context → permission → subject resolution (on create) → domain behaviour → optimistic persist → audit → domain-event hook → search upsert hook (`onVerificationUpserted`) → observation → stored aggregate / DTO

## Dependencies (injected)

| Dependency               | Role                                                                    |
| ------------------------ | ----------------------------------------------------------------------- |
| `verifications`          | `VerificationRepository`                                                |
| `subjectResolver`        | Optional; default in-memory permissive registry at Platform composition |
| `audits`                 | Optional appender                                                       |
| `onDomainEvent`          | Optional domain-event hook                                              |
| `onVerificationUpserted` | Search projection hook                                                  |
| `onObservation`          | Observability timing/outcome                                            |
| `runInTransaction`       | Optional transactional boundary                                         |

Domain remains the sole business-rule authority (ENG-040A ACCEPTED).
