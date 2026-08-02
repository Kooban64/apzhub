# APZQEP Health Checks

| Check           | Command / Path                                                 |
| --------------- | -------------------------------------------------------------- |
| Platform health | `GET /api/health`                                              |
| Auth session    | Sign-in smoke                                                  |
| Cap workspaces  | Manual open of six Cap routes                                  |
| API auth        | Authenticated `GET /api/v1/qep/suites` (expect 200/empty list) |

Automated Cap facets on `/api/health`: not present (MR-003).
