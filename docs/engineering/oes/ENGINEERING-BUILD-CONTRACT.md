# APZOR Engineering Build Contract

| Item             | Value                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------ |
| Document         | **Engineering Build Contract**                                                             |
| Version          | **1.0.0** (IN FORCE — APZQEP-GOV-ENG-BUILD-001 Accepted 2026-07-29)                        |
| Status           | **IN FORCE**                                                                               |
| Normative parent | [OES-003](./OES-003-Engineering-Build-Contract-and-Wave-Engineering-Standard.md)           |
| Authority        | Owner — APZQEP-GOV-ENG-BUILD-001 **ACCEPTED** 2026-07-29                                   |
| Applies to       | Every Engineering Wave / Engineering programme under APZQEP (and adopting APZOR platforms) |

**Normative language:** **SHALL** / **MUST** = mandatory; **SHOULD** = strong recommendation; **MAY** = optional.

---

## 0. Purpose

This Contract tells implementers (human or AI) **exactly how they are allowed to engineer**.

It exists to prevent redesign, scope creep, speculative features, and silent deviation during production engineering.

This Contract is **mandatory**. Violation is a programme defect requiring stop and Owner escalation where governance authority is required.

---

## 1. Engineering authority boundaries

| Authority                                     | Owns                                                                                           | Engineering Wave may           |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------ |
| Architecture (Accepted)                       | Boundaries, aggregates, lifecycle, non-goals                                                   | Implement only; never redesign |
| Engineering Specification (Accepted)          | Engineering contracts, interfaces, persistence logical model, API/security/Workbench contracts | Implement only; never change   |
| Engineering Build Contract                    | Execution rules for Engineering                                                                | Obey                           |
| Owner Instruction for the Wave                | Authorised scope for this Wave                                                                 | Implement only that scope      |
| Frozen baselines                              | Certified/frozen packages                                                                      | Reference only; never modify   |
| Platform Constitution / OES trilogy / OES-003 | Governance                                                                                     | Obey                           |

Engineering **SHALL NOT** invent Architecture or Engineering Specification decisions.

---

## 2. Permitted engineering behaviour

Engineering **SHALL**:

1. Implement only the Owner-authorised Wave scope.
2. Conform to Accepted Architecture and Accepted Engineering Specification.
3. Prefer the smallest change that satisfies the authorised scope.
4. Keep Domain pure where Architecture/OES require purity.
5. Route client traffic through platform APIs / Application as specified.
6. Use platform authz, audit, events, search patterns as specified — no private forks.
7. Add tests for new production behaviour.
8. Document new public interfaces (exports, REST resources, manifests).
9. Keep the repository buildable after the Wave.
10. Record evidence and a deviation register (empty if none).
11. Stop and escalate on architectural conflict or missing authority.

---

## 3. Prohibited engineering behaviour

Engineering **SHALL NOT**:

1. Redesign Architecture.
2. Change Engineering Specifications (including “clarifying” normative contracts without Owner/ADR process).
3. Silently introduce new behaviour beyond Architecture / OES / Wave Instruction.
4. Implement unauthorised Waves or future Waves early.
5. Modify frozen capability baselines.
6. Ship placeholder production code, TODO production logic, stub implementations presented as complete, temporary mocks in production paths, or commented-out production code.
7. Add speculative features, “while we are here” extras, or premature abstractions not required by the authorised scope.
8. Bypass `availableActions` / layer rules / connector rules defined by Architecture/OES.
9. Skip tests for new production behaviour.
10. Leave the repository non-buildable at Wave completion.
11. Continue after an architectural conflict without Owner decision.
12. Auto-start the next Wave.

---

## 4. Architectural compliance rules

1. Architecture is sole architectural authority for the capability.
2. Conflicts with Architecture **SHALL** stop the Wave immediately.
3. ADR-required changes **SHALL** be escalated to Owner — not invented in code.
4. Layer boundaries (Presentation → Application → Domain → Infrastructure → Adapters) **SHALL** be preserved.
5. Modules **SHALL NOT** call connectors/backends directly.

---

## 5. Engineering Specification compliance rules

1. Engineering Specification is the authoritative implementation blueprint.
2. Public APIs, Domain commands, permissions, persistence logical model, events, and Workbench contracts **SHALL** match the OES.
3. Refinements that do not change meaning (e.g. file layout within package boundaries) **MAY** proceed if they do not alter contracts.
4. Any contract change requires Owner-approved change / ADR — not silent code divergence.

---

## 6. Repository integrity requirements

1. No secrets in repo, logs, or commits.
2. No unrelated drive-by refactors.
3. No modification of unrelated capabilities.
4. Manifest-first artefacts (`module.yaml`, `service.yaml`, `event.yaml`, `component.yaml`) **SHALL** be created when required by platform SDKs **before** corresponding implementation in that Wave’s scope.
5. Formatting/lint/type rules of the monorepo **SHALL** be satisfied for touched code.
6. Git history for the Wave **SHOULD** be reviewable; do not rewrite shared history.

---

## 7. Incremental delivery requirements

1. One bounded Wave at a time.
2. Every Wave **SHALL** be independently Owner-reviewable.
3. Every commit in a Wave **SHOULD** leave the workspace buildable; Wave completion **SHALL** leave it buildable.
4. Partial unfinished production behaviour **SHALL NOT** be marked complete.
5. Feature flags **MAY** be used only if Architecture/OES/Wave Instruction allow; they are not a license for speculative features.

---

## 8. Testing obligations

1. New production behaviour **SHALL** have automated tests at the appropriate pyramid layer(s).
2. Domain Waves **SHALL** include Domain unit tests for commands/invariants touched.
3. Application/Infrastructure Waves **SHALL** include unit/integration/API tests as applicable.
4. Workbench Waves **SHALL** include component and critical-path E2E/a11y expectations per OES.
5. Tests **SHALL NOT** assert forbidden architectures (e.g. Workbench inventing transitions).

---

## 9. Documentation obligations

1. New public interfaces **SHALL** be documented (package README / API notes / Storybook as applicable).
2. Wave completion report **SHALL** list public interfaces added/changed.
3. Deviation register **SHALL** be filed even when empty.
4. Docs-only programmes remain allowed; this Contract applies when production engineering occurs.

---

## 10. Public interface discipline

1. Exported symbols, REST paths, permission strings, event names, and DTO shapes **SHALL** match Engineering Specification catalogues unless Owner-approved change exists.
2. No experimental public exports “for later.”
3. Internal helpers **SHALL** remain internal (package export surface controlled).

---

## 11. Package quality expectations

1. TypeScript strict; no `any` escapes without recorded Owner/engineering exception.
2. Dependency direction respects package boundaries.
3. No circular dependencies introduced.
4. Package version bumps follow platform SemVer policy and are **not** performed unless the Wave Instruction authorises versioning work.

---

## 12. Error handling expectations

1. Domain errors typed; Application maps to API error categories.
2. No raw backend/engine leakage to clients.
3. Ingestion/trust boundaries enforce reject/quarantine paths as specified.
4. Fail closed on authz/tenant violations.

---

## 13. Build stability requirements

1. Applicable `pnpm` lint / typecheck / test / build gates for touched packages **SHALL** pass at Wave completion.
2. CI-equivalent local verification **SHALL** be recorded in Wave evidence.
3. Broken mainline at Wave completion is a failed Wave.

---

## 14. Evidence requirements

Each Wave **SHALL** produce:

- Completion report
- Build Contract compliance checklist
- Architecture / OES traceability
- Test evidence summary
- Deviation register
- Owner Summary + Owner Review/Acceptance template
- Evidence JSON under `docs/operations/evidence/portfolio-recert/`
- Standing Record / index updates as required by programme practice

---

## 15. Stop conditions

Engineering **SHALL STOP** and not present the Wave as complete when:

1. Architecture conflict is detected.
2. Engineering Specification conflict is detected.
3. Authorised scope is insufficient to proceed correctly.
4. Frozen baseline would need modification.
5. Build/tests fail and cannot be fixed within authorised scope without redesign.
6. Governance authority is required (new ADR, scope change, waiver).
7. Owner Instruction is ambiguous after clarification attempt fails.

Stop state: escalate with a clear Owner Decision request. Do not invent a resolution.

---

## 16. Deviation handling

1. All deviations **SHALL** be recorded in the Wave Deviation Register.
2. Deviations that change Architecture/OES meaning **SHALL** escalate to Owner before merge/completion.
3. Editorial/non-normative doc fixes inside the Wave **MAY** proceed if they do not alter contracts.
4. Silent deviations are defects.

---

## 17. Owner escalation rules

Escalate immediately for Owner Decision when:

| Situation                       | Example Owner verbs                             |
| ------------------------------- | ----------------------------------------------- |
| Scope insufficient              | AUTHORISE scope expansion / RETURN Wave         |
| Architecture change needed      | AUTHORISE ADR / Architecture revision programme |
| OES change needed               | AUTHORISE OES revision programme                |
| Combine/skip Waves              | AUTHORISE exception with conditions             |
| Accept failed gates with waiver | WAIVE with recorded conditions (discouraged)    |
| Rollback required               | ORDER revert                                    |

Acknowledge/Recognise/Confirmed from Owner does **not** authorise Engineering or waive this Contract.

---

## 18. Affirmation (required in every Wave completion report)

```text
This Wave was executed under the APZOR Engineering Build Contract.
Architecture was not redesigned.
Engineering Specification was not changed.
Only authorised Wave scope was implemented.
Repository buildability and required tests/docs were satisfied (or escalated).
Deviations are listed in the Deviation Register.
```

---

## STOP

```text
ENGINEERING BUILD CONTRACT
1.0.0
IN FORCE
MANDATORY FOR ALL FUTURE ENGINEERING
```
