# APZHUB Platform Permission Catalogue

**Milestone:** OSS-110-06 / OSS-110-08 / **OSS-110-10**  
**Status:** Canonical catalogue for gateway-exposed platform capabilities  
**Package:** `@apzhub/platform-services` (`permission-catalogue.ts`)  
**Authority:** [ADR-0050](../adr/ADR-0050-production-authorisation-policy-enforcement.md)

---

## Naming convention

```text
{capability}.{action}
```

Support domain (OSS-110-10) also uses nested keys:

```text
support.{resource}.{action}
```

Special key: `platform.impersonation.use`

| Capability       | Meaning                                                                              |
| ---------------- | ------------------------------------------------------------------------------------ |
| `workspace`      | Workspace service operations                                                         |
| `project`        | Project (and nested status/label) operations                                         |
| `task`           | Task operations (OSS-110-08)                                                         |
| `team`           | Team operations                                                                      |
| `user`           | User directory operations                                                            |
| `search`         | Unified search execution                                                             |
| `administration` | Platform administration surfaces                                                     |
| `provider`       | Provider management                                                                  |
| `mapping`        | Entity-mapping administration                                                        |
| `support.*`      | Support domain (requests, articles, organizations, groups, users, search, analytics) |

| Action       | Meaning                     |
| ------------ | --------------------------- |
| `list`       | Enumerate collections       |
| `read`       | Read a single resource      |
| `create`     | Create                      |
| `update`     | Update                      |
| `archive`    | Soft-retire / archive       |
| `delete`     | Hard delete where exposed   |
| `manage`     | Broad operational manage    |
| `administer` | Administrative control      |
| `execute`    | Run a capability (search)   |
| `transition` | Task state transition       |
| `assign`     | Task assignee mutation      |
| `label`      | Task label mutation         |
| `schedule`   | Sprint/schedule association |
| `organise`   | Module organisation         |
| `parent`     | Parent-task relationship    |

Keys are deterministic, documented, and extensible. Do not invent free-form strings for gateway operations when a catalogue entry exists.

---

## Catalogue (OSS-110-06)

### Workspaces

`workspace.list` · `workspace.read` · `workspace.create` · `workspace.update` · `workspace.archive` · `workspace.delete` · `workspace.manage` · `workspace.administer`

### Projects

`project.list` · `project.read` · `project.create` · `project.update` · `project.archive` · `project.delete` · `project.manage` · `project.administer`

### Teams

`team.list` · `team.read` · `team.create` · `team.update` · `team.archive` · `team.delete` · `team.manage` · `team.administer`

### Users

`user.list` · `user.read` · `user.create` · `user.update` · `user.archive` · `user.delete` · `user.manage` · `user.administer`

### Search

`search.execute` · `search.list` · `search.read`

### Support (OSS-110-10)

`support.requests.list` · `support.requests.read` · `support.requests.create` · `support.requests.update` · `support.requests.assign` · `support.requests.transition` · `support.requests.manage` · `support.requests.administer`  
`support.articles.list` · `support.articles.read` · `support.articles.create` · `support.articles.manage` · `support.articles.administer`  
`support.organizations.list` · `support.organizations.read` · `support.organizations.create` · `support.organizations.update` · `support.organizations.archive` · `support.organizations.manage` · `support.organizations.administer`  
`support.groups.list` · `support.groups.read` · `support.groups.create` · `support.groups.update` · `support.groups.manage` · `support.groups.administer`  
`support.users.list` · `support.users.read` · `support.users.manage` · `support.users.administer`  
`support.search.execute` · `support.search.list` · `support.search.read`  
`support.analytics.read` · `support.analytics.list`

### Administration / provider / mapping

`administration.manage` · `administration.administer` · `administration.read`  
`provider.manage` · `provider.administer` · `provider.read`  
`mapping.administer` · `mapping.manage` · `mapping.read`

### Impersonation

`platform.impersonation.use`

---

## Role mapping (summary)

Uses established APZHUB roles from `@apzhub/platform-authorization` seed (not Plane roles):

| Role (typical)         | Intent                                        |
| ---------------------- | --------------------------------------------- |
| Platform administrator | Governed override for catalogued platform ops |
| Administrator          | Broad tenant administration grants            |
| Manager                | Elevated operational grants                   |
| Standard user          | Least-privilege operational grants            |

Exact grants live in authorization seed / persistence. Resolution precedence is defined in ADR-0050.

---

## Forward compatibility

Do not add catalogue entries for unimplemented capabilities unless required for structural consistency. Extend the catalogue when new gateway operations ship.

---

## Related

- [Platform Service Authorization](../architecture/APZHUB-Platform-Service-Authorization.md)
- `packages/platform-services/src/authorization/operation-authorization-map.ts`
