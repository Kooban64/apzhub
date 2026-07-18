# Notification Error Model (APZNOTIFY-003)

Uses central API v1 translator (`translatePlatformApiError` / `PlatformServiceError` mapping):

| Condition                           | HTTP                               |
| ----------------------------------- | ---------------------------------- |
| Invalid input                       | 400                                |
| Unauthenticated                     | 401                                |
| Permission denied                   | 403                                |
| Not found / protected               | 404                                |
| Conflict / invalid transition       | 409                                |
| Validation                          | 422                                |
| Delivery unsupported                | 501 (reserved; no delivery routes) |
| Service disabled / persistence down | 503                                |

No SQL, stacks, secrets, or provider details in errors.
