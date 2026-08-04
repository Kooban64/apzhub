# APZQEP-165-QO-006 — Enterprise Policy & Quality Selection Engine

| Field             | Value                                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| Programme         | APZQEP-165                                                                                               |
| Engineering Slice | **QO-006**                                                                                               |
| Legacy Slice      | S06                                                                                                      |
| Title             | Enterprise Policy & Quality Selection Engine                                                             |
| Status            | **COMPLETE**                                                                                             |
| Package           | `@apzhub/platform-orchestration` **0.1.5**                                                               |
| Timestamp         | 20260804T102458Z                                                                                         |
| Evidence          | [evidence/apzqep-165-qo-006/20260804T102458Z/](../../../../evidence/apzqep-165-qo-006/20260804T102458Z/) |
| Next              | **QO-007** — Enterprise Quality Gate Engine (separate Owner Auth)                                        |

## Mission

Provider-neutral Policy Decision Point for governed quality decisions.

Given impact graph, governance policy, risk, and confidence targets — determine **what quality activities are required**. Never execute them.

## Core principle

Policies are **declarative** — they express _what_ must be true, not _how_ to achieve it.

```text
Profiles → Policies → Rules → Quality Activities (advisory)
```

## Documents

- [POLICY-MODEL.md](./POLICY-MODEL.md)
- [RULE-MODEL.md](./RULE-MODEL.md)
- [POLICY-PROFILES.md](./POLICY-PROFILES.md)
- [QUALITY-ACTIVITIES.md](./QUALITY-ACTIVITIES.md)
- [SELECTION-DECISION.md](./SELECTION-DECISION.md)
- [EXPLAINABILITY.md](./EXPLAINABILITY.md)
- [API.md](./API.md)
- [TESTING.md](./TESTING.md)
- [CERTIFICATION.md](./CERTIFICATION.md)
- [COMPLETION.md](./COMPLETION.md)
- [OWNER-AUTHORISATION.md](./OWNER-AUTHORISATION.md)
