# Project Isolation — APZQEP-152

| Field          | Value                                        |
| -------------- | -------------------------------------------- |
| Programme      | APZQEP-152                                   |
| Artefact       | PROJECT-ISOLATION                            |
| Timestamp      | 20260803T064000Z                             |
| Classification | **Known limitation** — attribute filter only |

---

## Current behaviour

Cap A–F list/create/query paths accept optional `projectId` as a **client-supplied attribute filter** (and persist it on aggregates where the domain model includes it).

Examples: suite list query, execution plan/workspace list, defects, enterprise requirements, enterprise reporting facts/collect.

There is **no** platform-complete project membership ACL check on Cap HTTP or domain paths under APZQEP-152.

## Security implication

| Threat                                                                           | Status                                                  |
| -------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Cross-tenant access via projectId                                                | Mitigated by session tenant + RLS                       |
| Same-tenant access to another project’s Cap data by guessing/filtering projectId | **Not blocked** by membership ACL                       |
| Cap permission (RBAC)                                                            | Required for Cap ops; does not imply project membership |

## Programme decision

Project membership model completion would be platform project ACL work beyond Cap HTTP remediation. No architecture redesign was authorised under APZQEP-152.

**Owner/Board:** register as known limitation until a platform project-membership API is wired without redesign, or a future programme authorises that work.

See [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md) KL-152-01.
