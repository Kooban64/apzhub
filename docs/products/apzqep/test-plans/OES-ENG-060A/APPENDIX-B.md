# APZQEP-OES-ENG-060A — APPENDIX B — Lifecycle Transition Matrix

## Allowed transitions

| From \ To | draft | review | approved | ready | in_execution | completed | archived | rejected | cancelled | superseded |
| --------- | ----- | ------ | -------- | ----- | ------------ | --------- | -------- | -------- | --------- | ---------- |
| draft | — | submit | — | — | — | — | — | — | cancel | — |
| review | —* | — | approve | — | — | — | — | reject | cancel | — |
| rejected | return | — | — | — | — | — | — | — | cancel | — |
| approved | — | — | — | markReady | — | — | — | — | cancel | supersede |
| ready | — | — | — | — | start | — | — | — | cancel | supersede |
| in_execution | — | — | — | — | — | complete | — | — | — | — |
| completed | — | — | — | — | — | — | archive | — | — | supersede |
| archived | — | — | — | — | — | — | — | — | — | — |
| cancelled | — | — | — | — | — | — | — | — | — | — |
| superseded | — | — | — | — | — | — | — | — | — | — |

\* `review → draft` only via `reject` then `returnToDraft`, not direct withdraw in v1.

## Illegal examples (MUST fail)

- `rejected → approved`  
- `draft → approved`  
- `ready → draft`  
- Edit items while `approved`  
- `archive` from `ready`  
- `startExecution` with readiness failure  
