# APZQEP-120-S11 — Product Board Recommendation

| Field        | Value                                                       |
| ------------ | ----------------------------------------------------------- |
| Status       | **SUPERSEDED** — Owner authorised; S11 **COMPLETE** / PASS  |
| Prerequisite | APZQEP-120-S10 Product Board **CERTIFIED**                  |
| Framing      | **Quality Knowledge Index** (not “a search page”)           |
| Timestamp    | 20260802T145908Z                                            |
| Completed    | 20260802T150615Z — [S11-COMPLETION.md](./S11-COMPLETION.md) |

---

## Framing

Do **not** treat S11 as “search UI.”

Treat S11 as:

> **Quality Knowledge Index** — the authoritative searchable representation of APZQEP.

Search is one consumer of the index. The index itself is the capability.

## Intended coverage (eventually)

| Domain                            | Indexed via events (progressive) |
| --------------------------------- | -------------------------------- |
| Evidence                          | S11 initial                      |
| Suites                            | later                            |
| Runs                              | later                            |
| Defects                           | later                            |
| Requirements                      | later                            |
| Documents                         | later                            |
| Audit records                     | later                            |
| Events                            | later                            |
| AI context / QI / Command Palette | later projections                |

S11 builds **indexing capability**, not a search page.

## Platform Rule (record before S11 starts)

```text
Platform Rule

Search SHALL consume the Event Platform.

Search SHALL never query business services to build its index.

Business services publish events.

Search builds projections.

Search is eventually consistent.
```

Implications:

- Search is a **projection**
- Business services remain **authoritative**
- Indexes can always be **rebuilt from events**
- AI later consumes the **same projections**

This is a **platform architecture rule** — not an Enterprise Standard.

## Critical path (Board)

```text
S01–S10 ✅
  → S11 Quality Knowledge Index
    → S12 Notifications
      → S13 Command Palette
        → S14 Suites → S15 Runs → S16 Execution
          → S17 Defects → S18 Traceability
            → S19 Reporting → S20 Close-out
```

## Authority

S11 requires a formal **Owner Authorisation Pack** before engineering starts.
