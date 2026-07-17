# Identity Assignment Guide

## Permission assignments

`IdentityPermissionAssignment` stores permission key metadata for a subject (`user` | `group` | `role`). Does not evaluate authorization at runtime.

## Service assignments

`IdentityServiceAssignment` records which platform capabilities a subject may access:

`projects` · `support` · `testing` · `reporting` · `documents` · `search` · `workflow` · `workflow-engine` · `notifications` · `configuration` · `administration`

**No provisioning** — metadata only.

Helpers: `listAssignedPermissionKeys`, `listAssignedServiceCapabilities`, `assertServiceAssignmentActive`.
