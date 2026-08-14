# SPR-APZQEP-203 — Governed Quality Assist

> **Status:** **DELIVERED** — 2026-08-14  
> **Parent:** [SPR-APZQEP-200](./SPR-APZQEP-200-competitive-full-swing.md)  
> **Depends on:** SPR-APZQEP-202 foundation (may start after 202 ships core)  
> **Hard rule:** **AI never certifies**; suggestions require human approve; default OFF until flag

## Owner authorisation

Owner directed programme completion through 203–204 on 2026-08-14. Bounded assist is authorised:

- External OpenAI when `.secrets/openai` / env present **or**
- Local/rule assist when external unavailable
- Feature flag: `APZHUB_QEP_AI_ASSIST=true` required for live LLM calls
- Audit every assist session; never silent SoR writes; never GO/NO-GO

## Ships

| ID    | Ship                 | Approach                                                                      |
| ----- | -------------------- | ----------------------------------------------------------------------------- |
| 203-A | Assist service       | Audited sessions: coverage gaps, failure explain, test draft, suite recommend |
| 203-B | QI / OpenAI provider | Reuse APZPEN OpenAI pattern behind QI; refuse without flag/secret             |
| 203-C | AI Workspace         | Un-stub `qep-ai-workspace`; list sessions; accept/reject suggestions          |
| 203-D | Hard gates           | Certify APIs remain human-only; assist cannot call decide                     |

## Acceptance

1. AI Workspace not stub.
2. At least two assist modes produce audited suggestions.
3. Without flag/secret, assist returns honest disabled state (rule fallback optional).
4. No path from assist → certification decision.
5. Tests cover refuse-without-auth and never-certify guard.

## Delivered implementation

- `qep-ai-workspace` and its Workbench Framework manifest are active and
  permission-gated by `qep.ai_workspace.read` / `qep.ai_workspace.operate`.
- `apps/web/lib/qep/quality-assist-service.ts` owns the governed business
  workflow; `quality-assist-store.ts` persists tenant-scoped sessions and their
  immutable audit trail under the QEP ledger root.
- Four modes ship: `coverage_gaps`, `failure_explain`, `test_draft`, and
  `suite_recommend`.
- Live OpenAI requests require both `APZHUB_QEP_AI_ASSIST=true` and a server-side
  `OPENAI_API_KEY`. An explicit live request is honestly disabled when either is
  missing; normal sessions use deterministic rule-based assist.
- API routes list/create sessions and record human accept/reject actions.
  Acceptance only updates the advisory ledger; it does not write a
  certification outcome.
- The service has no certification-decide dependency, always persists
  `certificationDecision: null`, and enforces a defence-in-depth
  never-certify operation guard.
- Unit tests verify live-provider refusal without the feature flag, acceptance
  without certification, and the never-certify guard.

## Verification

- Governed Quality Assist unit suite: **4 passed**.
- Platform manifest validation suite: **15 passed**.
- Changed-file ESLint: **passed**.
- Web typecheck has no errors in SPR-203 files; the repository-wide web
  typecheck remains blocked by pre-existing errors outside this sprint.

## Non-goals

Auto-certify; unbounded agent autonomy; MCP full DX (thin tools only if time).
