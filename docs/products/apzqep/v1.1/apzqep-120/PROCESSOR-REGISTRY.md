# Processor Registry — APZQEP-120-S09

## Rules

- Processors SHALL be registered at composition time.
- Processors SHALL NOT be hard-coded inside the engine.
- Resolution: exact `eventType` match, then `*` capability.

## Contract (`EventProcessor`)

| Concern              | Support                                        |
| -------------------- | ---------------------------------------------- |
| Capability discovery | `descriptor.capabilities`                      |
| Execution            | `execute(ProcessingContext)`                   |
| Acknowledgement      | `ProcessingResult.outcome = acknowledged`      |
| Retry decision       | `outcome = retry` (+ retryable)                |
| Terminal failure     | `terminal_failure` / `dead_letter` / permanent |
| Replay compatibility | `descriptor.replayCompatible`                  |

## S09 processors

Only `createNullEventProcessor` ships for tests/smoke. Business processors are S10+.
