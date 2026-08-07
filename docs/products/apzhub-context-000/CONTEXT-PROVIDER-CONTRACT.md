# Context Provider Contract

| Field     | Value                               |
| --------- | ----------------------------------- |
| Programme | APZHUB-CONTEXT-000                  |
| Status    | **COMPLETE** (await Owner Approval) |
| Timestamp | 20260806T131000Z                    |

## Provider role

A **Context Provider** is an enterprise product (or authorised capability) that may **contribute** attributed context fragments for a focus work object.

Providers extend this contract. They do not redefine composition, ownership, or consumer rules.

## Universal provider rules

1. Contribute only data the provider **owns** or is authorised to project.
2. Never expose another product’s SoR as if it were the provider’s.
3. Never require consumers to call the provider’s engine or adapter.
4. Respect the user’s permissions in the provider product.
5. Attribute fragments with provider identity and source entity reference.
6. Prefer stable business identifiers; engines stay invisible.
7. Version contribution shapes backward-compatibly (see Evolution Guide).
8. On failure: return empty / degraded slice with reason class — never fabricated content.

## What providers must never expose

| Forbidden                                         | Reason                  |
| ------------------------------------------------- | ----------------------- |
| Raw engine payloads / vendor brands as identity   | Technology independence |
| Secrets, credentials, internal tokens             | Security                |
| Data the user cannot access in the source product | Authz                   |
| Authoritative copies of another SoR’s truth       | Ownership               |
| Unattributed assertions                           | Traceability            |

## Initial providers

### Projects (Work)

| May contribute                                                                           | Must never expose                                                                        |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Project identity, status, membership summary, milestone/health signals owned by Projects | Support tickets, Law obligations, Documents files, Workflow runs as Projects-owned truth |

**Ownership:** Projects remains SoR for project / delivery objects.  
**Versioning:** Project-focused contribution is the primary v1 focus type.

### Support (Service)

| May contribute                                                                   | Must never expose                                               |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Open / related incidents for the focus (e.g. project), status, priority, summary | Project plans, Law policies, Documents content as Support-owned |

**Ownership:** Support remains SoR for tickets / service cases.

### Workflow (Process)

| May contribute                                                                          | Must never expose                                               |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Outstanding approvals / journey stage signals relevant to focus; business-intent labels | Engine runs/schedules as product identity; other products’ SoRs |

**Ownership:** Workflow remains SoR for process / journey definitions (intent).  
**Note:** Execution details stay behind the intent curtain.

### Documents (Information)

| May contribute                                                                 | Must never expose                                                    |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| Related document references, titles, linkage to focus, lifecycle state summary | File bytes as Context SoR; governance obligations as Documents-owned |

**Ownership:** Documents remains SoR for information / files.

### Law (Governance)

| May contribute                                                         | Must never expose                                                         |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Applicable obligations / policies / reviews by reference for the focus | Legal advice; practice/matter identity; other products’ operational truth |

**Ownership:** Law remains SoR for governance artefacts.  
**Boundary:** APZHUB-internal governance only.

### Knowledge (Organisational Memory)

| May contribute                                                         | Must never expose                                                     |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Relevant lessons, procedures, standards, guidance attributed as memory | Files, tickets, policies as Knowledge-owned truth; AI/search identity |

**Ownership:** Knowledge remains SoR for organisational memory objects only.  
**Derivation:** Memory remains derived; Context must not present memory as operational SoR.

## Future providers

Time, Analytics, and others join by **extending** this document (Evolution Guide) — same rules, new rows. No redesign of composition.

## Versioning expectations

| Expectation                    | Rule                                               |
| ------------------------------ | -------------------------------------------------- |
| Additive contributions         | Preferred                                          |
| Breaking contribution shape    | Requires Owner Auth + consumer migration note      |
| Removal of a contribution type | Deprecated with notice; consumers tolerate absence |
