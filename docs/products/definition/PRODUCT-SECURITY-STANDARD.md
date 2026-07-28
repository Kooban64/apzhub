# Product Security Standard (Definition Stage)

> **Programme:** APZHUB-PRODUCTS-003 · Aligns with foundation 007 / 013

## Purpose

At Definition, products must state security and compliance intent — not implement controls.

## Mandatory Definition coverage

| Topic               | Definition expectation                                                                |
| ------------------- | ------------------------------------------------------------------------------------- |
| Authentication      | Consume Platform Auth (BetterAuth); no product-owned login engines for standard users |
| RBAC                | Platform PermissionService; product permission catalogue intent                       |
| ABAC                | Declare if attribute-based rules are required                                         |
| POPIA / GDPR        | Personal data categories, lawful basis sketch, minimisation                           |
| KYC / KYB           | In/out of scope; never imply Platform already provides unless true                    |
| Audit               | Mutating/privileged operations must be auditable via Platform Audit                   |
| Encryption          | Data in transit (TLS); at-rest expectations                                           |
| Secrets             | Never in product repos; Platform secret handling                                      |
| Data classification | Public / Internal / Confidential / Restricted sketch                                  |
| Retention           | Retention intent per entity class                                                     |
| DR / BCP            | RTO/RPO intent; hosting assumptions                                                   |

## Zero Trust

Every future product API must assume: verify identity, permission, integrity, intent, context — Definition must not propose frontend-only security.

## Brand and identity

- No engine login screens for standard users
- No backend role names in UI
- Superadmin remains Platform special tier, not a product bypass

## Definition exit

Security section incomplete → Definition **not** ready for Business Approval.
