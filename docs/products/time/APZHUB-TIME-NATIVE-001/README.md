# APZHUB-TIME-NATIVE-001 — APZ Time Native Platform Experience

| Field          | Value                                              |
| -------------- | -------------------------------------------------- |
| Programme      | **APZHUB-TIME-NATIVE-001**                         |
| Product        | **APZ Time**                                       |
| Classification | **Adoption & Product Evolution**                   |
| Status         | **STARTED**                                        |
| Timestamp      | 20260804T193500Z                                   |
| Parent         | APZQEP-ADOPT-001 Phase 1                           |
| Baseline       | Production **1.0.0** ACCEPTED/CLOSED — [../](../)  |
| Authority      | [OWNER-AUTHORISATION.md](./OWNER-AUTHORISATION.md) |
| Roadmap        | [ROADMAP.md](./ROADMAP.md)                         |

## Reality check

| Fact           | Value                                                     |
| -------------- | --------------------------------------------------------- |
| APZ Time 1.0.0 | Exists — production accepted                              |
| Kimai adapter  | Certified (`@apzhub/integration-kimai` 0.2.0)             |
| This programme | Maturation / native experience — **not** product creation |

## Objective

> Make APZ Time feel like a first-class APZHUB product while preserving the existing production capability.

Success metric for Phase A: an APZHUB employee spends a day in APZ Time and **never once thinks about Kimai**.

Wrong metric: “Does APZ Time expose every Kimai feature?”  
Right metric: “Does APZ Time provide the experience our users need?”

## Contract principle

> The product contract is APZ Time. The implementation contract is the Kimai adapter. These evolve independently.

## Priority order (Phase A slices)

1. **A01 Native UX Audit** — **COMPLETE** — [TIME-NATIVE-001-A01](./TIME-NATIVE-001-A01/)
2. **A02 Identity Convergence** — **COMPLETE** — [TIME-NATIVE-001-A02](./TIME-NATIVE-001-A02/)
3. A03 Workspace Integration — pending Owner Auth
4. A04 APZQEP Operational Adoption — pending
5. Daily-use Phase 1 gaps only (not Kimai parity)

See [ROADMAP.md](./ROADMAP.md) (Phases A → B → C).

## Deliverable register

| #   | Deliverable              | Artefact                                                                                             | Status      |
| --- | ------------------------ | ---------------------------------------------------------------------------------------------------- | ----------- |
| 1   | Owner Auth (maturation)  | [OWNER-AUTHORISATION.md](./OWNER-AUTHORISATION.md)                                                   | **DONE**    |
| 1a  | A01 Native UX Audit      | [TIME-NATIVE-001-A01/APZ-TIME-NATIVE-UX-AUDIT.md](./TIME-NATIVE-001-A01/APZ-TIME-NATIVE-UX-AUDIT.md) | **DONE**    |
| 2   | Roadmap A/B/C            | [ROADMAP.md](./ROADMAP.md)                                                                           | **DONE**    |
| 3   | Vision (native refresh)  | [VISION.md](./VISION.md)                                                                             | **STARTED** |
| 4   | UX native principles     | [UX-NATIVE-PRINCIPLES.md](./UX-NATIVE-PRINCIPLES.md)                                                 | **STARTED** |
| 5   | Functional specification | [FUNCTIONAL-SPECIFICATION.md](./FUNCTIONAL-SPECIFICATION.md)                                         | Pending     |
| 6   | Integration architecture | [INTEGRATION-ARCHITECTURE.md](./INTEGRATION-ARCHITECTURE.md)                                         | Pending     |
| 7   | Identity & permissions   | [IDENTITY-AND-PERMISSIONS.md](./IDENTITY-AND-PERMISSIONS.md)                                         | Pending     |
| 8   | Workspace & navigation   | [WORKSPACE-AND-NAVIGATION.md](./WORKSPACE-AND-NAVIGATION.md)                                         | Pending     |
| 9   | Operational model        | [OPERATIONAL-MODEL.md](./OPERATIONAL-MODEL.md)                                                       | Pending     |
| 10  | APZQEP quality binding   | [APZQEP-QUALITY-INTEGRATION.md](./APZQEP-QUALITY-INTEGRATION.md)                                     | **STARTED** |

Existing product pack: [../VISION.md](../VISION.md) · [../KNOWN-LIMITATIONS.md](../KNOWN-LIMITATIONS.md).
Friction → [ADOPT-001](../../apzqep/apzqep-adopt-001/).
