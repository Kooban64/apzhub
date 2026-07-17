# Identity Group Model

`IdentityGroup` is a tenant-scoped group catalogue (`key`, `name`, status).

Users join groups through `IdentityMembership` (`kind: "group"`). Roles and permission assignments may target groups via `subjectKind: "group"`.
