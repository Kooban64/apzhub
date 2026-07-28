# Constraints

- Platform 1.3 compatibility · ADR-0071/0072 retained
- Presentation → Platform Services → Connector → Engine
- Deny-by-default · tenant/org isolation · audit
- Provider abstraction · no product→provider calls
- No Email SoR / mailbox / inbound · no WebSockets
- Integration SDK 1.0.0 freeze
- Additive migrations · no implementation under ADR-0073
- SMTP deferred · Workflow Execute gated · FIN-001 STOP
- Shared-host coexistence (ENVIRONMENT.md)
- Prefer extend 0065 entities over duplicate SoR
