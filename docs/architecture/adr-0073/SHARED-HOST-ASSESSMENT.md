# Shared-Host Assessment

| Topic               | Stance                                                         |
| ------------------- | -------------------------------------------------------------- |
| Minimum topology    | API + 1 worker + Postgres on coexistence host                  |
| Worker isolation    | Separate process/identity preferred                            |
| Resource contention | Bound claim batch size & concurrency                           |
| DB connections      | Pool limits; measure under E02                                 |
| Graceful shutdown   | Required                                                       |
| Duplicate worker    | Safe via leases                                                |
| Suitability claim   | **Not certified until Platform-1.4-ENG-002 capacity evidence** |

Do not claim shared-host GA without measured evidence.
