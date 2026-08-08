# APS-E-04 — Ownership hygiene: Command

| Field     | Value                                    |
| --------- | ---------------------------------------- |
| Status    | **COMPLETE** (rationalise — not rewrite) |
| Timestamp | 20260808T233500Z                         |
| Canonical | **APS-Command** (APS-S-03)               |
| Package   | `@apzhub/command-framework`              |

---

## Finding

| Artifact                                | Classification                                                        |
| --------------------------------------- | --------------------------------------------------------------------- |
| `@apzhub/command-framework` + shell UCP | **Canonical Platform Service**                                        |
| `@apzhub/qep-command`                   | **Product-local QEP Enterprise Command Platform** — ownership anomaly |

---

## Rationalisation (no UX break)

1. **Canonical owner** of cross-product command/palette actions is APS-Command only.
2. `@apzhub/qep-command` is **reclassified** as QEP product command machinery — not an APS inventory row.
3. New cross-product commands register via `@apzhub/command-framework`.
4. Package merge/deletion deferred until zero-break convergence path exists.
5. Candidate Law 7 watch: one canonical command contract.

---

## RC1 evidence contribution

- Clear owner: APS-Command
- Multi-product + Constitution
- Anomaly named; no second Platform Service invented
