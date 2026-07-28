# Idempotency and Deduplication

Intent unique on (tenantId, idempotencyKey). Delivery unique on (tenantId, intentKey:channel:userId). Event replay safe. Diagnostics expose deduplication counts.
