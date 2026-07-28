# Requirements Production Readiness

## Verdict

**PRODUCTION READY WITH LIMITATIONS** for the authorised APZ QEP Requirements capability baseline (`@apzhub/qep-requirements` **1.0.0**).

## Preconditions to operate

1. Platform 1.4 certified runtime (auth, gateway, PostgreSQL, Redis as applicable).
2. Apply QEP Requirements migrations through **0078** in order (0072–0078).
3. Deploy `@apzhub/qep-requirements` **1.0.0** and `apps/web` Workbench surfaces.
4. Grant required `qep.requirements.*` (and relationship/baseline subsets) permissions.
5. Confirm search publication hooks for requirements, baselines, and relationships.

## Go / No-go checklist

| Check | Go criteria |
| ----- | ----------- |
| Migrations | 0072–0078 applied without error |
| Health | Platform + QEP health endpoints OK |
| AuthZ | View-only user cannot mutate; modify/transition permissions work |
| Workbench | Open Requirement, Baseline, Relationship list/detail |
| Smoke | Create draft relationship → activate; lock baseline path verified previously |
| Search | Projection lag acceptable; detail reload from SoR |

## Qualifications

See [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md). Limitations are intentional scope boundaries unless noted as operational constraints (e.g. search eventual consistency, Playwright depth).
