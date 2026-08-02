# Product Rule — Traceability is Derived

| Field      | Value                                   |
| ---------- | --------------------------------------- |
| Status     | **IN FORCE**                            |
| Authority  | Product Board (APZQEP-140-E AUTHORISED) |
| Applies to | APZQEP-140-E onward                     |

```text
Requirements are authored and governed independently.

Suites, execution plans, execution sessions, evidence and defects
remain the authoritative sources for their own domains.

The Traceability Engine derives and maintains the relationships
between them automatically.

Coverage SHALL be calculated. It SHALL NOT be manually maintained.
```

| Concern                                         | Role                                          |
| ----------------------------------------------- | --------------------------------------------- |
| Requirements (Cap E)                            | Expectations — independent lifecycle          |
| Suites / Plans / Execution / Evidence / Defects | Domain SoRs — Cap A–D                         |
| Traceability Engine                             | Derived relationships (not a manual document) |
| Coverage Calculator                             | Derived metrics — never hand-edited           |

Traceability SHALL reference immutable Cap C execution history and Evidence Platform artefacts. Requirements SHALL NOT mutate execution.
