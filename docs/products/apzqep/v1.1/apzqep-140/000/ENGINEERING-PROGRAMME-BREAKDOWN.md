# Engineering Programme Breakdown — APZQEP-140-000

| Field     | Value                       |
| --------- | --------------------------- |
| Programme | APZQEP-140-000              |
| Status    | **COMPLETE** (architecture) |
| Timestamp | 20260802T163547Z            |

Recommended engineering programmes under **APZQEP-140**. Each requires its own Owner Authorisation Pack. Slice IDs inside a programme are local (S01…) unless Board prefers global S14+.

---

## Programme map

| Programme ID       | Title                                 | Capability | Wave          |
| ------------------ | ------------------------------------- | ---------- | ------------- |
| **APZQEP-140-000** | Core Quality Engineering Architecture | —          | 0 (this pack) |
| **APZQEP-140-A**   | Suite & Library Management            | A          | 1             |
| **APZQEP-140-B**   | Test Run Management                   | B          | 2             |
| **APZQEP-140-C**   | Test Execution Productisation         | C          | 3             |
| **APZQEP-140-D**   | Defect & Quality Findings             | D          | 4             |
| **APZQEP-140-E**   | Requirements & Traceability           | E          | 5             |
| **APZQEP-140-F**   | Reporting & Analytics                 | F          | 6             |

Optional alias mapping for stakeholders who prefer legacy S-numbers:

| Alias | Programme |
| ----- | --------- |
| S14   | 140-A     |
| S15   | 140-B     |
| S16   | 140-C     |
| S17   | 140-D     |
| S18   | 140-E     |
| S19   | 140-F     |

---

## Recommended slices (indicative)

### APZQEP-140-A — Suites

| Slice | Focus                                 |
| ----- | ------------------------------------- |
| A-S01 | Domain + service + events             |
| A-S02 | API + persistence                     |
| A-S03 | QKI + commands + notifications wiring |
| A-S04 | Workbench module + CERT               |

### APZQEP-140-B — Runs

| Slice | Focus                                |
| ----- | ------------------------------------ |
| B-S01 | Domain + scheduling/assignment model |
| B-S02 | API + events                         |
| B-S03 | Notify + QKI + commands              |
| B-S04 | UI + CERT                            |

### APZQEP-140-C — Execution

| Slice | Focus                                          |
| ----- | ---------------------------------------------- |
| C-S01 | Align existing TE package to Core QE contracts |
| C-S02 | Manual execution UX + evidence link            |
| C-S03 | Events / QKI / commands                        |
| C-S04 | Automation hook ports (no vendor lock) + CERT  |

### APZQEP-140-D — Defects

| Slice | Focus                   |
| ----- | ----------------------- |
| D-S01 | Domain + lifecycle      |
| D-S02 | Links + API             |
| D-S03 | QKI + notify + commands |
| D-S04 | UI + CERT               |

### APZQEP-140-E — Traceability

| Slice | Focus                          |
| ----- | ------------------------------ |
| E-S01 | Relationship model + APIs      |
| E-S02 | Coverage projection processors |
| E-S03 | Trace matrix UI + CERT         |

### APZQEP-140-F — Reporting

| Slice | Focus                     |
| ----- | ------------------------- |
| F-S01 | Analytic projection model |
| F-S02 | Operational dashboards    |
| F-S03 | Executive views + CERT    |

---

## Dependencies on APZQEP-120 (immutable)

Every programme consumes:

`platform-outbox` · `platform-processing` · `qep-knowledge-index` · `qep-notification` · `qep-command` · `qep-evidence`

No private outbox, no business-service notification logic, no search against SoR.

---

## Future programmes (out of band)

| Programme  | Notes                                                    |
| ---------- | -------------------------------------------------------- |
| APZQEP-160 | Intelligence & AI — consumes QKI + events                |
| ALM sync   | Adapter programmes per engine — after Core QE SoR stable |
