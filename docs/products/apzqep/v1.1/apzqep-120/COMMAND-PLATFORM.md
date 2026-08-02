# Enterprise Command Platform — APZQEP-120-S13

| Field     | Value                           |
| --------- | ------------------------------- |
| Programme | APZQEP-120                      |
| Slice     | S13                             |
| Package   | `@apzhub/qep-command` **0.1.0** |
| Status    | **ACTIVE**                      |
| Phase     | Platform Foundation Completion  |

## Principle

> The Command Palette is only the first client.

| Role      | Owner                                          |
| --------- | ---------------------------------------------- |
| Discover  | Quality Knowledge Index (projections)          |
| Register  | Command Registry (deterministic)               |
| Execute   | Command Execution Engine → registered handlers |
| Authorise | Permission / role resolution                   |
| Authority | Business services (via handlers only)          |

Future clients without redesign: Executive Dashboard, AI Assistant, Quality Intelligence, Automation, Integrations.

## Platform Architecture Rule

```text
The Command Platform SHALL consume the Quality Knowledge Index.

The Command Platform SHALL execute registered Command Handlers.

The Command Platform SHALL NOT invoke business services directly
except through registered handlers.

Search discovers.

Commands execute.

Business services remain authoritative.
```

Not an Enterprise Standard.

## Contract

```text
Command → Handler → Execution Result
                      ├─ Success
                      ├─ Failure
                      ├─ Validation Error
                      └─ Permission Denied
```

Engine knows **HOW**. Handlers know **WHAT**. No switch-based routing.

## Pipeline

```text
Client (Palette / AI / Dashboard / …)
  → Command Platform
        → Discovery (QKI only)
        → Ranking (pinned / favourite / recent / score)
        → Permission Resolution
        → Handler Execution
```

## Related

- [COMMAND-REGISTRY.md](./COMMAND-REGISTRY.md)
- [COMMAND-HANDLERS.md](./COMMAND-HANDLERS.md)
- [COMMAND-DISCOVERY.md](./COMMAND-DISCOVERY.md)
- [COMMAND-SECURITY.md](./COMMAND-SECURITY.md)
- [COMMAND-RANKING.md](./COMMAND-RANKING.md)
