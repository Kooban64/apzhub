# Processor Registry — Platform + Product

## Platform layer (S09)

`@apzhub/platform-processing` · `createProcessorRegistry()`

- Processors SHALL be registered at composition time.
- Processors SHALL NOT be hard-coded inside the engine.
- Resolution: exact `eventType`, then `*`.

## Product layer (S10)

`createEvidenceProcessorRegistry({ business })` · `registerOnto(platformRegistry)`

- Deterministic Evidence processor set (7 processors).
- Metadata: version, health, ownership, introducedIn.
- `registerProductProcessorBundles` composes Evidence + future Search/Notify/UCP bundles.

## Platform Architecture Rule (S10)

```text
The Processing Engine SHALL execute registered processors.

The Processing Engine SHALL never contain business processing logic.

Business processing SHALL exist only inside registered processors.

Processor registration SHALL be the only extension mechanism.
```

Recorded as a **platform architecture rule** — not an Enterprise Standard.
