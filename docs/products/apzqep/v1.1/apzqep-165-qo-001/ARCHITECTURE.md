# ARCHITECTURE — QO-001

Preserves frozen Wave 5 architecture:

- Orchestration coordinates registered capabilities; does not absorb peer SoR
- Kernel is the first implementable surface of `@apzhub/platform-orchestration`
- No architecture changes in this slice

```text
createPlatformOrchestration
        ↓
OrchestrationKernel (lifecycle)
        ↓
CapabilityRegistry (empty framework)
ContractRegistry (kernel contracts)
LifecycleRegistry (kernel lifecycle registration)
OrchestrationContainer (DI)
```
