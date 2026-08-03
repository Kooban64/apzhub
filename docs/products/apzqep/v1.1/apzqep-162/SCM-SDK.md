# SCM SDK — APZQEP-162

## Bootstrap

```ts
import { createPlatformScm } from "@apzhub/platform-scm";

const scm = createPlatformScm({
  githubOffline: true,
  webhookSecrets: { github: process.env.APZHUB_SCM_GITHUB_WEBHOOK_SECRET },
  publishEvent: async (event) => {
    // forward to platform event bus / Evidence / QKI / Notifications
  },
});
```

## QEP facade

```ts
import { createQepScm } from "@apzhub/qep-scm";

const qep = createQepScm({
  githubOffline: true,
  onScmEvent: async (event) => {
    // Automation / Evidence / QKI consumers
  },
});

await qep.connectProvider("tenant-1", "github", crypto.randomUUID());
const repository = await qep.registerRepository({
  tenantId: "tenant-1",
  providerId: "github",
  fullName: "apzor/apzhub",
  registeredBy: "user-1",
});
```

## Public surface

| Export                 | Purpose                              |
| ---------------------- | ------------------------------------ |
| `createPlatformScm`    | Platform bootstrap                   |
| `ScmEngine`            | Repository / webhook / events engine |
| `ScmProviderRegistry`  | Provider discovery                   |
| `createGitHubProvider` | GitHub provider factory (internal)   |
| Contracts              | Repository, provider, webhook, event |

## Rules

- Depend on `@apzhub/platform-scm` contracts — never on GitHub Octokit types.
- Do not import `@apzhub/platform-scm/providers/github` from product UI.
- Future providers implement `ScmProvider` and register at bootstrap.
