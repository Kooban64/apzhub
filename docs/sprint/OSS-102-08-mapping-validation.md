# OSS-102-08 Canonical Mapping Validation Report

> **Milestone:** OSS-102-08  
> **Date:** 2026-07-11  
> **Verdict:** **PASS**

---

## Domain distinctions (mandatory)

| Zammad concept | Canonical APZHUB | Must NOT map to |
| --- | --- | --- |
| Ticket | Support Request (`sreq_zammad_*`) | Project Task / Plane Issue |
| Article | Support Article (`sart_zammad_*`) | Project Comment |
| Organization | Support Organisation (`sorg_zammad_*`) | Project workspace |
| Group | Support Group (`sgrp_zammad_*`) | Project team (Projects domain) |
| User | Support User (`suser_zammad_*`) | Plane member |

Automated tests in `testing/wave2/wave2-certification.test.ts` assert Ticket≠Task and Article≠Comment.

---

## Provisional provider-boundary IDs

IDs are provisional adapter-boundary identifiers until EntityMappingStore integration:

| Prefix | Entity |
| --- | --- |
| `sreq_zammad_` | Support request |
| `sorg_zammad_` | Organisation |
| `sgrp_zammad_` | Group |
| `suser_zammad_` | Support user |
| `sart_zammad_` | Article |
| `satt_zammad_` | Attachment metadata |
| `shist_zammad_` | History event |
| `shit_*_zammad_` | Search hit |

**Not** APZHUB global SoR IDs. Future Platform mapping must replace provisional IDs with stable platform IDs.

---

## Validation results

| Check | Result |
| --- | --- |
| Provider-native payloads leak to public DTOs | PASS — mappers strip vendor fields |
| Unknown enums | PASS — map to `unknown` / safe defaults |
| Optional relationships | PASS — null assignee/org handled |
| Null values | PASS — optional fields omitted safely |
| Malformed provider responses | PASS — mapping/validation errors via runner |
| MappingStore integration | **Not implemented** (correct for Wave 2) |

---

## Requirements before Platform SupportService

1. Persistent EntityMappingStore entries for support requests, orgs, groups, users, articles
2. Bidirectional provider ↔ platform ID resolution
3. Tenant-scoped uniqueness and audit fields
4. No provisional `*_zammad_*` IDs in HTTP/UI surfaces

Do not implement mapping-store integration in OSS-102-08.
