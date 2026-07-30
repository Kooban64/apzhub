# Use Case Orchestration Report — APZQEP-ENG-110D

## Capture

StoragePort.put → Domain.captureEvidence → UnitOfWork.evidence.save → collect events → audit append

## Version

StoragePort.update → Domain.replaceContent → save → collect events

## Dispose

Domain.disposeEvidence → save → StoragePort.dispose

## Integrity

StoragePort.exists (content present) → Domain.verifyIntegrity(providedActualHash) — **no hashing algorithm in Application**

## Unit of Work

All multi-step writes run inside `uow.execute`. In-memory UoW executes work; skeleton UoW remains non-activated for production DI.
