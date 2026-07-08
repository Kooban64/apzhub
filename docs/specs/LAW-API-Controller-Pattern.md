# LAW — API Controller Pattern

> **Story:** LAW-014-05  
> **Status:** Implementation guide  
> **Last updated:** 2026-07-06

---

## Principle

Controllers (route handlers) remain **thin**. They:

1. Parse and validate the HTTP request
2. Delegate to a **WorkflowService** via the workflow runner
3. Map domain results to API DTOs
4. Return standard envelopes via framework response helpers

Business rules, validation, and persistence live in **WorkflowService** and **legal-business-core** — not in controllers.

---

## Layer diagram

```
Next.js route.ts
  └─ withLawApiAuth(handler, AUTH_PRESET)
       └─ createLawApiController(handlerImpl)     ← logging + error translation
            └─ handlerImpl
                 ├─ parseJsonBody / requireRequestFields
                 ├─ parseClientListQuery (entity query parser)
                 └─ withClientWorkflowService(context, service => ...)
                      └─ ClientWorkflowService (law-platform)
                           └─ ClientRepository + validators
```

---

## Route file (minimal)

```typescript
export const runtime = "nodejs";

import {
  GET,
  POST,
  handleListClients,
  handleCreateClient,
  CLIENT_LIST_AUTH,
  CLIENT_CREATE_AUTH,
} from "@/lib/api/clients";
import { withLawApiAuth } from "@/lib/api";

export const GET = withLawApiAuth(handleListClients, CLIENT_LIST_AUTH);
export const POST = withLawApiAuth(handleCreateClient, CLIENT_CREATE_AUTH);
```

Routes only wire HTTP methods to handlers and auth presets.

---

## Handler file structure

### 1. Implementation function (private logic)

```typescript
async function handleListClientsImpl(request, context): Promise<NextResponse> {
  const query = parseClientListQuery(request.nextUrl.searchParams);

  return withClientWorkflowService(context, (service) => {
    const results = service.searchClients(query.criteria);
    // map → paginate → paginatedResponse()
  });
}
```

### 2. Exported handler (wrapped)

```typescript
export const handleListClients = createLawApiController(handleListClientsImpl, {
  operation: "listClients",
});
```

### 3. Auth presets

```typescript
const clientAuthPresets = defineResourceAuth(CLIENT_AUTH);
export const CLIENT_LIST_AUTH = clientAuthPresets.list;
```

---

## Handler checklist

| Step              | Framework helper                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| Parse list query  | `parsePagination`, `parseSorting`, `parseFiltering` (via entity parser)                          |
| Parse JSON body   | `parseJsonBody`                                                                                  |
| Required fields   | `requireRequestFields`                                                                           |
| If-Match          | `parseIfMatchVersion`, `ifMatchPreconditionResponse`                                             |
| Workflow call     | `withClientWorkflowService` / `createWorkflowRunner`                                             |
| Validation errors | `workflowValidationToResponse`                                                                   |
| Not found         | `notFoundResponse(context, "Client not found.")`                                                 |
| Success           | `successResponse`, `createdResponse`, `updatedResponse`, `archivedResponse`, `paginatedResponse` |

---

## Path parameter handlers

For routes with `{clientId}`:

```typescript
export async function handleGetClient(
  request,
  context,
  clientId,
): Promise<NextResponse> {
  return createLawApiController((req, ctx) => handleGetClientImpl(req, ctx, clientId), {
    operation: "getClient",
  })(request, context);
}
```

The route resolves `clientId` from params and passes it to the handler.

---

## Adding a new resource (e.g. Matter)

1. Create `apps/web/lib/api/matters/` mirroring `clients/`
2. Define permissions and `defineResourceAuth(MATTER_AUTH)`
3. Create DTO mapper aligned with OpenAPI schemas
4. Create query parser using framework query helpers + entity criteria
5. Create service bridge with `createWorkflowRunner({ createService: ... MatterWorkflowService })`
6. Implement handlers using framework responses/errors
7. Add route files under `app/api/law/v1/matters/`
8. Add integration tests mirroring `client-api.test.ts`

---

## Anti-patterns

| Do not                                         | Do instead                                              |
| ---------------------------------------------- | ------------------------------------------------------- |
| Put business validation in handlers            | Use WorkflowService + legal-business-core validators    |
| Construct `{ ok: false, error: ... }` manually | Use `notFoundResponse`, `validationErrorResponse`, etc. |
| Create repository instances in handlers        | Use workflow runner + shared repository factory         |
| Skip `withLawApiAuth`                          | Always bind auth, tenant, and persistence scope         |

---

## Reference implementation

Client API: `apps/web/lib/api/clients/client-api-handlers.ts`
