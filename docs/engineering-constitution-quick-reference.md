# APZHUB Engineering Constitution quick reference

Derived lookup for [000](./000-apzhub-engineering-constitution.md).

> **Document Version:** 1.0 · **Engineering Constitution · Mandatory**  
> **Highest authority** — on conflict, 000 wins over all other docs, SDKs, and sprints.

## Vision & mission

Enterprise Operating Platform · one workbench · users never see backends · self-hosted · modular · replaceable · long-lived

## Ten principles (non-negotiable)

| #   | Principle                                                                            |
| --- | ------------------------------------------------------------------------------------ |
| 1   | **Platform first** — infra before features                                           |
| 2   | **Self-hosted first** — OSS default                                                  |
| 3   | **Backend agnostic** — Module → Service → Integration → Engine                       |
| 4   | **Manifest first** — manifest before code                                            |
| 5   | **SDK first** — no custom patterns; ADR for exceptions                               |
| 6   | **Services own business logic** — UI presents; integrations communicate              |
| 7   | **Event driven** — events over direct deps                                           |
| 8   | **Security by design** — auth, authz, audit, validation, encryption, least privilege |
| 9   | **Test everything** — tests are part of dev                                          |
| 10  | **Documentation is code** — no docs = incomplete                                     |

## Every contribution must

Compile · lint · test · a11y · naming · repo standards · update docs · changelog

## Prohibited (unless ADR)

Module↔module direct · UI↔integration direct · business logic in React · hardcoded permissions/colours · secrets in repo · proprietary deps without approval · duplicate platform capabilities

## Repository layers

Applications · packages · services · workers · infrastructure · documentation

## Quality priorities

Maintainability · readability · simplicity · performance · a11y · reliability · replaceability

## Governance

ADRs in `docs/decisions/` for significant architecture changes

## Cursor before code

Read arch docs → SDK → sprint → confirm deps → approved scope only → tests → docs → **stop at sprint boundary**

Execution order: **BUILD-001 → SPR-001** (then later sprints)

## Success

One unified platform · replaceable backends · add capabilities without redesign · safe AI contribution · maintainable for years
