# Operational Context

Workspace packages include three context records:

| Context     | Purpose                                             |
| ----------- | --------------------------------------------------- |
| Operational | Readiness package ref, environment, workflow groups |
| Role        | Opaque role/persona/capability hints (external IAM) |
| Session     | Session ref, locale/timezone, restore hints         |

Identity and permissions remain external. Context never grants permissions.
