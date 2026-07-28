# Platform 1.4 Explicit Exclusions

Unless a separate Owner-approved programme authorises an exception, Platform 1.4 **excludes**:

- Platform 2.0
- Architecture replacement / Platform Services redesign / Request Pipeline redesign / ProductionAuthorizationProvider replacement
- Integration SDK changes / thaw
- WebSockets / new realtime transport
- Email System of Record implementation
- Mailbox / inbound email / email archive / email search / email composition product
- Marketing automation / campaign management / bulk messaging
- Arbitrary SMS / push / WhatsApp / Teams / Slack delivery
- Workflow Execute implementation
- FIN-001 implementation
- Support chat
- Collaborative editing
- Unrelated product features and unrelated refactoring
- Provider-specific product logic
- Destructive migrations
- Cloud lock-in dependencies without ADR
- **Any implementation under ARCH-001**

Transactional external delivery (conditional E06) is **not** Email SoR and remains adapter-scoped if later approved.
