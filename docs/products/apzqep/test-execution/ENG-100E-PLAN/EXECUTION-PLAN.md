# ENG-100E Execution Plan (planning only)

## Objective

Implement the Test Execution Workbench presentation per OES-ENG-090A PART-04 §3 and ARCH-015 Workbench contracts — binding exclusively to `/api/v1/qep/executions` DTOs and `availableActions`.

## Preconditions

1. ENG-100D Accepted / Wave 4 Baselined
2. Owner AUTHORISE ENG-100E
3. REST API operational

## Sequence

1. `module.yaml` Workbench registration (nav, permissions, routes) — no hardcoding in shell
2. Design-system components only (tokens, shadcn, Lucide)
3. Execution explorer / queue views (assigned, review queue)
4. Execution workspace — header, steps, evidence refs, observations, history, action bar from `availableActions` only
5. Deep links + permission-aware rendering
6. Client API module calling gateway only (never Domain/Infrastructure)
7. Playwright + component tests; a11y
8. Wave evidence + Owner pack; stop before ECR unless separately authorised

## Out of scope

Infrastructure redesign · new Domain rules · Certification · Freeze · ECR (separate programmes)
