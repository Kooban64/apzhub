# Code Review Standard

> **Programme:** APZHUB-OPERATIONS-001  
> **Related:** [DEFINITION-OF-DONE](./DEFINITION-OF-DONE.md) · [AI-ENGINEERING-STANDARDS](../foundation/AI-ENGINEERING-STANDARDS.md) · Document 013 Security · Document 015

---

## Purpose

Minimum review expectations for every pull request into protected branches.

---

## Review checklist

### Scope & process

- [ ] Programme ID / hotfix severity referenced
- [ ] Change matches Owner-approved scope
- [ ] No drive-by refactors or unrelated files

### Architecture review

- [ ] Layering respected (Module → Service → Connector → Engine)
- [ ] No UI imports of adapters / `platform-services` / gateways
- [ ] Freezes untouched (or ADR + Owner linked)
- [ ] Engine branding masked

### Security review

- [ ] AuthN/AuthZ/validation on new APIs
- [ ] No secrets in code/logs
- [ ] Input validation (Zod/schemas) present
- [ ] Safe error messages (no provider leakage)

### Performance review

- [ ] No unbounded work in request handlers
- [ ] Lists paginated where applicable
- [ ] No accidental N+1 / sync blocking of obvious hot paths

### Testing review

- [ ] Unit/component tests for new logic
- [ ] Boundary tests for product UI clients
- [ ] E2E/UI cert updated when user flows change
- [ ] Tests assert behaviour, not implementation trivia

### Documentation review

- [ ] Sprint/pack/KF docs updated if status or behaviour changed
- [ ] KNOWN-LIMITATIONS honest
- [ ] OpenAPI updated if HTTP contracts added (when required)

### Quality review

- [ ] Typecheck/lint clean
- [ ] No `any` / `@ts-ignore` / `eslint-disable` without Owner-level exception
- [ ] Naming per Document 002

---

## Reviewer roles

| Role           | Focus                                     |
| -------------- | ----------------------------------------- |
| Peer engineer  | Correctness, tests, clarity               |
| Technical Lead | Quality gates, merge readiness            |
| Architect      | Layering, freezes, ADR need               |
| Product Owner  | Scope / acceptance criteria (product PRs) |

---

## Merge rule

No PR merges to `main` with failing required CI checks. Review approval does not override red CI.
