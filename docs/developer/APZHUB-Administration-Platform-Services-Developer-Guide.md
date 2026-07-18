# APZHUB Administration Platform Services Developer Guide

**Milestone:** APZADMIN-002

## Consume via gateway

```typescript
const administration = createAdministrationPlatformServicesForTest({
  allowInMemoryPersistence: true,
});
const { gateway } = createPlatformServices({
  administration,
  authorizationMode: "allow-all", // tests only
});

const module = await gateway.administration.modules.create(ctx, {
  key: "projects",
  name: "Projects",
});
```

## Do

- Call Platform Services / gateway only
- Use `admin.*` permissions
- Keep business rules in `@apzhub/admin-core`

## Do not

- Import persistence repositories from products
- Call connectors or backends from modules
- Implement HTTP, Workbench, user management, or runtime admin actions here
- Use legacy `administration.manage|read|administer` for this SoR surface

## Packages

| Package                     | Version |
| --------------------------- | ------- |
| `@apzhub/admin-contracts`   | 0.2.0   |
| `@apzhub/admin-core`        | 0.2.0   |
| `@apzhub/admin-persistence` | 0.1.0   |
| `@apzhub/platform-services` | 0.22.0  |

## Audit

```bash
pnpm audit:administration-platform-services
pnpm audit:admin-foundation
```
