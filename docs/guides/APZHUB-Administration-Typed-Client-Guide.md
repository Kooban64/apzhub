# APZHUB Administration Typed Client Guide

**Package path:** `apps/web/lib/administration`  
**Milestone:** APZADMIN-003

## Usage

```ts
import {
  createHttpAdministrationClient,
  getAdministrationClient,
  listModules,
  administrationQueryKeys,
} from "@/lib/administration";

const client = createHttpAdministrationClient();
const { items } = await client.listModules({ status: "draft" });
```

## Rules

- Call **only** `/api/v1/administration/*`
- Never import `@apzhub/platform-services`, `@apzhub/admin-core`, `@apzhub/admin-persistence`, or `getPlatformServiceGateway`
- Forbidden path segments are rejected by `assertAdministrationApiPath`
- Tests may inject `createMockAdministrationClient()` via `setAdministrationClient`

## Query keys

All keys are rooted at `["administration", …]` — see `query-keys.ts`.
