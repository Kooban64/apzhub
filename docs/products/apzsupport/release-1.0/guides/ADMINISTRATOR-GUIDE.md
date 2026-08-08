# APZ Support — Administrator Guide (v1.0)

## Permissions

Grant Support catalogue permissions (`support.requests.*`, `support.articles.*`, organisations/groups/users/search/analytics as needed). UI and API fail closed without grants.

## Configuration

| Flag                         | Guidance                                                                      |
| ---------------------------- | ----------------------------------------------------------------------------- |
| `ZAMMAD_INTEGRATION_ENABLED` | Required for adapter registration in environments that use the Support engine |
| `ENTITY_MAPPING_STORE_MODE`  | Production: `postgres`                                                        |
| Realtime flags               | Leave unset for v1.0 honesty (see Known Limitations)                          |

Do not expose engine brand names to end users.
