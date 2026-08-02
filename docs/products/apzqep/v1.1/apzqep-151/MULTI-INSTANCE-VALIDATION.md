# Multi-Instance Validation

Topology: two `createDb()` clients (simulated instances) against one PostgreSQL.

Results: concurrent Cap A save with same expected revision — second instance receives stale_revision; winner revision retained.

Test: `testing/apzqep-151/multi-instance.integration.test.ts`
