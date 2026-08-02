# APZHUB Portfolio Engineering — Ownership Model

| Field     | Value                                                                  |
| --------- | ---------------------------------------------------------------------- |
| Document  | OWNERSHIP-MODEL                                                        |
| Programme | APZHUB-ENG-002                                                         |
| Phase     | 0                                                                      |
| Status    | DRAFT — with Charter                                                   |
| Parent    | [PORTFOLIO-ENGINEERING-CHARTER.md](./PORTFOLIO-ENGINEERING-CHARTER.md) |

---

## 1. Roles

| Role                   | Responsibility                                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Owner**              | Authorises programmes and phases; constitutional exceptions; portfolio freeze/release outside this Charter |
| **Product Board**      | Certifies Charter; approves promotions; certifies enterprise standards; portfolio engineering direction    |
| **Architecture Board** | Ensures promoted standards align with Foundation architecture; flags boundary violations                   |
| **Engineering**        | Authors drafts; produces evidence; implements in products; technical review                                |
| **QA**                 | Validates testing/certification claims in promotion packs; quality gates                                   |
| **Release**            | Confirms promotion ≠ release authority; protects Lifecycle boundaries                                      |
| **AI Engineering**     | Executes authorised slices under AI Operational Framework; no silent authority expansion                   |

---

## 2. Artefact ownership

| Artefact                       | Owner                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------- |
| Portfolio Engineering Charter  | Product Board (after certification); Engineering maintains under change control |
| Enterprise standards (Active)  | Product Board (authority); Engineering (stewardship)                            |
| Promotion Matrix (working)     | Engineering under Board visibility                                              |
| Product Engineering Frameworks | Product Owner / Product Board for that product                                  |
| Product KEEP PRODUCT standards | Product                                                                         |
| Slice Specifications           | Product Engineering under Owner slice authority                                 |
| APZHUB-ENG-001 Slice Standard  | Portfolio (frozen)                                                              |

---

## 3. RACI (promotion of a standard)

| Activity                           | Owner | Product Board | Arch Board | Engineering     | QA    | Release |
| ---------------------------------- | ----- | ------------- | ---------- | --------------- | ----- | ------- |
| Propose candidate                  | C     | I             | I          | **R/A**         | C     | I       |
| Genericise content                 | I     | I             | C          | **R**           | C     | I       |
| Architecture review                | I     | I             | **A**      | R               | C     | I       |
| Engineering certification evidence | I     | I             | I          | **R**           | **A** | I       |
| Product Board promotion decision   | C     | **A**         | C          | R               | C     | C       |
| Publish Active standard            | I     | **A**         | I          | **R**           | I     | I       |
| Product citation adoption          | I     | I             | I          | **R** (product) | C     | I       |

R = Responsible · A = Accountable · C = Consulted · I = Informed

---

## 4. Separation of concerns

| Layer         | Must not do                                   |
| ------------- | --------------------------------------------- |
| Product Board | Implement code; bypass Promotion Principle    |
| Engineering   | Self-certify enterprise adoption              |
| QA            | Invent enterprise standards                   |
| Release       | Treat promotion as GA                         |
| Product teams | Fork enterprise rules locally                 |
| AI agents     | Open unauthorised phases or promote standards |
