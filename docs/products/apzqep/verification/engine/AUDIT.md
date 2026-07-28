# Audit

Platform audit actions (via application audit appender):

- `qep.verification.created`
- `qep.verification.requested`
- `qep.verification.assigned`
- `qep.verification.started`
- `qep.verification.verified`
- `qep.verification.rejected`
- `qep.verification.expired`
- `qep.verification.withdrawn`
- `qep.verification.superseded`
- `qep.verification.cancelled`
- `qep.verification.retired`
- `qep.verification.metadata_changed`
- `qep.verification.rationale_changed`
- `qep.verification.priority_changed`

**Distinction:** Verification History (domain table `qep_verification_history`) records state evolution; Platform Audit records operational who/when/context. They are not merged.
