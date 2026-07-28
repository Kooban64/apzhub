# Functional Requirements Standard

> **Programme:** APZHUB-PRODUCTS-004

## Purpose

Standardise how functional requirements are written so Definition and Architecture can consume them without ambiguity.

## Coverage (mandatory consideration)

| Area           | Examples                                                               |
| -------------- | ---------------------------------------------------------------------- |
| Features       | User-visible capabilities                                              |
| Business rules | Validations, calculations, state transitions                           |
| Workflows      | Multi-step processes, handoffs                                         |
| Permissions    | Intent for Platform PermissionService catalogue entries                |
| Notifications  | Events that should drive Attention Engine (not product-owned delivery) |
| Reporting      | Operational / management / compliance views                            |
| Integrations   | Platform-backed engines or external APIs (candidates only)             |

## Writing rules

1. One requirement = one testable statement.
2. Use IDs `FR-###`.
3. Prefer user/outcome language; avoid engine brand names in user-facing wording.
4. State actor and permission intent.
5. Declare Platform Service consumption intent — never Module → Engine.
6. Mark out-of-scope features explicitly (P3 / Won't).

## Quality checks

- [ ] Unambiguous
- [ ] Testable acceptance criteria present
- [ ] Priority and risk assigned
- [ ] No silent Platform freeze violations
