# Engineering Standards Baseline — APZQEP Version 1.1

Frozen discipline for all future work on or against the V1.1 baseline:

1. **Single responsibility** — one new responsibility per authorised programme/slice.
2. **Manifest / contract first** — no silent platform extensions.
3. **Immutable artefacts** — supersede via new packages; never mutate history.
4. **Past-tense events only** — no command events on the Event Backbone.
5. **References, not copies** — especially evidence, executive, workspace, ops packages.
6. **Authoritative vs advisory** — advisory never corrects decisions.
7. **Composition ≠ business logic** — workspace/executive/ops never own business state.
8. **Self-hosted / OSS-first** — no mandatory Enterprise Edition dependencies.
9. **Identity external** — tenant/project/actor/audit context only; RBAC outside orch.
10. **Definition of Done** — tests, docs, evidence, certification before merge.
11. **Host coexistence** — respect `ENVIRONMENT.md`; no unapproved disruption.
12. **Stop conditions** — architecture reopen requires Owner Authorisation + STOP report.

Foundation authorities remain Documents 000–029 and the Product Board register.
