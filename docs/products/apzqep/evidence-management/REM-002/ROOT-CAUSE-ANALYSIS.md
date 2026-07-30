# Root Cause Analysis — APZQEP-REM-002

## Symptom

Playwright journey `provenance sub-view loads timeline` failed:

```text
expect(getByText('Initial capture')).toBeVisible()
```

API mocks for `/api/v1/qep/evidence/{id}/provenance` were invoked successfully. The Workbench did not remain on the provenance route long enough to render the timeline.

## Diagnostic evidence

1. Provenance link `href` is correct: `/workspace/qep/evidence/items/ev_e2e_1/provenance`.
2. Mock fulfilled provenance GET with `detail: "Initial capture"`.
3. After click / direct navigation, URL frequently became `/workspace/home` (shell rewind).
4. When provenance briefly mounted, provenance API was called, then navigation aborted (`net::ERR_ABORTED`) as the shell pushed Home.
5. No delta in Evidence Workbench/API sources vs freeze candidate `ce220a5d` for the failing assertion path — failure is shell navigation timing/state.

## Mechanism

In `apps/web/components/workbench-page.tsx`:

1. Effect A: `activateViewForRoute(pathname)` — pathname → view.
2. Effect B: if pathname is outside `activeView.route`, `router.push(activeView.route)`.

Effect B depended on **both** `activeView.route` and `pathname`. On nested Evidence deep links (`…/items/{id}/provenance`), Effect B could run against a **stale Home** focus before Evidence view activation committed, rewinding the URL to `/workspace/home`.

Detail routes sometimes survived the race (hence intermittent FREEZE-era green); provenance nested depth made the rewind reliable in RELEASE-003 validation.

## Eliminated causes

| Area                           | Result                                                  |
| ------------------------------ | ------------------------------------------------------- |
| Test assertion text / selector | Correct against mock + ProvenanceView                   |
| API mock path matching         | Provenance requests matched and fulfilled               |
| Domain provenance generation   | Not exercised (mocked transport)                        |
| Security filtering             | Not implicated (mock)                                   |
| Persistence lifetime           | Not implicated (mock)                                   |
| Evidence package behaviour     | No packaging/behaviour delta vs candidate for this path |
