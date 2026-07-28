# APZQEP-OES-ARCH-013 — APPENDIX C — REST Resource Inventory (Architectural)

> Inventory only. **No handlers, schemas, or OpenAPI generation** in ARCH-013.

| Method (intent) | Resource                                      | Notes                            |
| --------------- | --------------------------------------------- | -------------------------------- |
| GET             | `/api/v1/qep/plans`                           | Filtered list; pagination        |
| POST            | `/api/v1/qep/plans`                           | Create Draft                     |
| GET             | `/api/v1/qep/plans/{planId}`                  | DTO + `availableActions`         |
| PATCH/PUT       | `/api/v1/qep/plans/{planId}`                  | Draft update; `expectedRevision` |
| POST            | `/api/v1/qep/plans/{planId}/actions/{action}` | Lifecycle commands               |
| GET             | `/api/v1/qep/plans/{planId}/items`            | Plan Items                       |
| POST            | `/api/v1/qep/plans/{planId}/items`            | Add item                         |
| PATCH           | `/api/v1/qep/plans/{planId}/items/{itemId}`   | Update / reorder                 |
| DELETE          | `/api/v1/qep/plans/{planId}/items/{itemId}`   | Remove item                      |
| GET             | `/api/v1/qep/plans/{planId}/history`          | History                          |
| GET             | `/api/v1/qep/plans/{planId}/versions`         | Versions                         |
| GET             | `/api/v1/qep/plans/{planId}/compare`          | Compare query params             |
| POST            | `/api/v1/qep/plans/{planId}/clone`            | Clone to Draft                   |

## Envelope

Future ENG **SHALL** use the standard APZHUB response envelope, correlation ids, and typed error categories (Document 010).
