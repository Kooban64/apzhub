# Event Versioning

- Multiple versions of the same event type may coexist.
- Older versions remain readable.
- No in-place mutation of definitions or published envelopes.
- Publishers select `eventVersion` explicitly, or the latest registered version is used.
