# Security Assessment

Preserve: authenticated commands · ProductionAuthorizationProvider · tenant/org isolation · least privilege worker identity · secrets isolation · config validation · input validation · rate limits · abuse controls · audit · redaction · safe diagnostics · privileged replay rights · provider credential boundaries (future ADR-0074).

No parallel authorisation system. Worker uses dedicated service identity. Admin replay is permission-gated and audited.
