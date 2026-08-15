# SPR-OPS-PAPERLESS-003 evidence

| Check                                             | Result                                           |
| ------------------------------------------------- | ------------------------------------------------ |
| Unit tests (paperless + documents-dms)            | PASS                                             |
| BetterAuth `POST /api/v1/documents/dms/documents` | PASS — `status=accepted`, `ingestId=dmsingest_*` |
| List after ingest                                 | PASS — title `APZHUB DMS Upload 003` present     |
| Paperless brand in payload                        | None                                             |
| Legacy `18082`                                    | Untouched (302)                                  |
