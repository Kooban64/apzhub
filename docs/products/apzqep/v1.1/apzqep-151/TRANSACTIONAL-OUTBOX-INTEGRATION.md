# Transactional Outbox Integration

- Reuses `@apzhub/platform-outbox` / table `platform_outbox_event`
- Cap web runtimes attach `createCoreQeOutboxPublisher`
- Enqueue resolves ALS executor so writes join Cap mutator transactions
- No second outbox introduced
- Delivery remains platform outbox worker responsibility (unchanged)
