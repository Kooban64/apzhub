# Wave 01 — Repository

| Item     | Value                                        |
| -------- | -------------------------------------------- |
| Wave     | **01 — Repository Scaffolding**              |
| Version  | **1.0.0**                                    |
| Parent   | [README.md](./README.md)                     |
| Contract | [../BUILD-CONTRACT.md](../BUILD-CONTRACT.md) |

**Normative language:** **SHALL** / **MUST** = mandatory; **SHOULD** = strong recommendation; **MAY** = optional.

---

## Objectives

1. Establish package/module layout, manifests, and tooling wiring for the capability.
2. Register capability artefacts with the monorepo workspace as required by platform SDKs.
3. Leave a buildable, empty-or-skeleton baseline ready for Domain Engineering.
4. Produce continuous evidence for Owner Wave Review.

---

## Authorised scope

Wave 01 **MAY** include, when named in the Owner Instruction:

- Package scaffolds and `package.json` / workspace wiring
- Manifest-first artefacts (`module.yaml`, `service.yaml`, `event.yaml`, `component.yaml`) required before later implementation
- README / index stubs that declare intent without fake production behaviour
- Tooling, lint, test harness wiring for the new package(s)
- Export surface placeholders that do not claim business completeness

Wave 01 **SHALL** implement only repository scaffolding unless the Owner Instruction explicitly authorises additional behaviour.

---

## Prohibited activities

1. Domain business rules, Application orchestration, Infrastructure adapters, or Workbench UI production behaviour (Wave 02–05).
2. Redesign of Architecture or change to ES contracts.
3. Modification of unrelated or frozen capability baselines.
4. Speculative features or “while we are here” extras.
5. Presenting stubs as complete production behaviour.
6. Auto-starting Wave 02.

---

## Success criteria

| Criterion   | Requirement                                               |
| ----------- | --------------------------------------------------------- |
| Scope       | Authorised scaffolding complete                           |
| Build       | Touched packages lint/typecheck/build as applicable       |
| Manifests   | Required manifests present before deferred implementation |
| Integrity   | No unrelated refactors; no secrets                        |
| Evidence    | Continuous evidence pack filed                            |
| Affirmation | Build Contract affirmation present                        |

---

## Stop condition

**IMPLEMENTED / AWAITING OWNER WAVE REVIEW** for Wave 01.

**STOP** and escalate if Architecture/ES conflict, frozen baseline would need change, or scope is insufficient for a correct scaffold.

---

## Owner decision gate

| Decision            | Effect                                     |
| ------------------- | ------------------------------------------ |
| ACCEPTED            | Wave 02 **MAY** be separately authorised   |
| RETURN FOR REVISION | Remediate under Wave 01                    |
| REJECTED            | Stop; Owner directs remediation / rollback |

---

## STOP

```text
WAVE 01 REPOSITORY
SCAFFOLD ONLY
AWAITING OWNER WAVE REVIEW
```
