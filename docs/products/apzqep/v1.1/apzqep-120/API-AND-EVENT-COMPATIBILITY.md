# API and Event Compatibility — APZQEP-120

**Rule:** Do not break v1.0 LA clients without documented strategy + Owner approval.

---

## Evidence HTTP/API

| Slice   | Existing                        | Proposed                                              | Compatibility                          |
| ------- | ------------------------------- | ----------------------------------------------------- | -------------------------------------- |
| S01     | List/search return broader sets | Same shape; **filtered** rows                         | Compatible (security narrowing)        |
| S03–S04 | Create/get/download             | Same routes; durable backend                          | Compatible; latency may change         |
| S05     | Optional client hash            | Server hash authoritative; may reject bad client hash | Document; prefer 4xx typed `INTEGRITY` |
| S06     | Delete                          | May 403 when retention/hold                           | Additive error category                |

Versioning: stay on current Evidence API major for LA; bump package patch/minor per [RELEASE-STRATEGY.md](./RELEASE-STRATEGY.md). Deprecation: none planned for list fields.

Contract tests: extend Evidence API tests per slice.

---

## Test Execution API

| Slice   | Existing                    | Proposed                                           | Compatibility                               |
| ------- | --------------------------- | -------------------------------------------------- | ------------------------------------------- |
| S02     | Attach/link may fail-closed | Deny/allow via Evidence ACL                        | Compatible fail-closed → correct deny/allow |
| S08–S09 | Execution states            | Same state machine; async completion more reliable | Compatible                                  |
| S15     | No OpenAPI                  | Published OpenAPI reflecting **current** handlers  | Docs additive; CI guards breaks             |
| S16     | Mocked runner               | Flag ON live                                       | Default OFF = compatible                    |

Breaking changes: forbidden without Owner + major version discussion.

---

## Events

| Slice | Existing  | Proposed                         | Compatibility                        |
| ----- | --------- | -------------------------------- | ------------------------------------ |
| S07   | Stub yaml | Validated `event.yaml` + publish | New consumers; no old consumer break |
| S10   | —         | Failure/replay events            | Additive                             |

Envelope (029): correlationId, causationId, tenant, actor, occurredAt, idempotencyKey.

Naming: past-tense `qep.evidence.created`, `qep.execution.completed`, etc. (exact names confirmed in S07 design confirmation against existing stubs).

Delivery: at-least-once; subscribers idempotent.

Webhooks: extension point only — not required for 120.

---

## Search API

| Slice | Change                      | Compatibility                              |
| ----- | --------------------------- | ------------------------------------------ |
| S11   | New entity types in results | Additive `type` values                     |
| S12   | Stricter ACL                | Fewer hits — compatible security narrowing |

Search remains non-authoritative.

---

## Notifications

| Slice | Change                 | Compatibility                      |
| ----- | ---------------------- | ---------------------------------- |
| S13   | New notification types | Additive; prefs default documented |

---

## Consumer impact matrix

| Consumer            | Risk            | Action                   |
| ------------------- | --------------- | ------------------------ |
| LA Evidence clients | Low if additive | Contract tests           |
| LA TE clients       | Low             | OpenAPI freeze after S15 |
| Internal workers    | Medium          | Version event schemas    |
| Future 130+         | Low             | Use S07 catalogue        |

---

## Contract test requirements

- S07: schema validate publish payload
- S15: OpenAPI vs routes
- S11: provider result schema
- Breaking detector in CI for TE/Evidence public routes when Owner authorises implementation CI changes (within those slices — not in planning)
